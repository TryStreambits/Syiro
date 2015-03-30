package main

import (
    "crypto/sha1"
    "encoding/hex"
    "encoding/json"
    "fmt"
    "os"
    "os/exec"
    "strings"
    "syscall"
    "path/filepath"
)

var currentDirectory , _ = os.Getwd() // Get the current working directory from os and assign it to currentDirectory

// #region Function is responsible for checking for file changes and recording them

func fileChanged(contentType, fileFullPath string, fileChangeChannel chan int) {
    var hashOfCurrentFile string // Define hashOfCurrentFile as a string of the hex encoded fileContent
    var storedSha1sum string // Define storedSha1sum as the stored stringified sha1sum if any
    fileChanged := 1 // Define fileChanged as a int, default to 1 (false)

    // #region Fetching File Info

    _, fileName := filepath.Split(fileFullPath) // Split the filepath until we get the file name

    sha1sumFilePath := "build/sha1sums/" + contentType + "/" + fileName // Define sha1sumFilePath as the path to the sha1sum file

    // #endregion

    // #region Obtain Sha1sum of File

    fileHandler, _ := os.Open(fileFullPath) // Open the file, returning an os.File struct
    fileContent := ReadFullFile(fileHandler) // Read the file content and push it to fileContent []byte
    fileHandler.Close() // Close the file

    byteSum := sha1.Sum(fileContent) // Get the byte array of the sum of the fileContent
    hashOfCurrentFile = hex.EncodeToString(byteSum[:]) // Convert byte array to slice, encode it to a string and output it as hash

    storedSha1sumFile, storedSha1sumFileError := os.OpenFile(sha1sumFilePath, syscall.O_RDWR, 0755) // Open the sha1sum file using os.Openfile so we can do read AND write, returning an os.File struct and any error

    // #endregion

    // #region Hash Comparison

    if storedSha1sumFileError == nil { // If we successfully fetched the sha1sum
        storedSha1sumFileContent  := ReadFullFile(storedSha1sumFile) // Read the sha1sum file content and push it to storedSha1sumFileContent []byte
        storedSha1sum = string(storedSha1sumFileContent[:])

        if storedSha1sum != hashOfCurrentFile { // If the current hash is not equal to the one stored
            fileChanged = 2
        }
    } else{ // If we did not successfully fetch the sha1sum
        fileChanged = 2 // Set fileChanged to true
    }

    // #endregion

    if fileChanged == 2 { // If the file has been changed
        WriteOrUpdateFile(sha1sumFilePath, []byte(hashOfCurrentFile))
    }

    storedSha1sumFile.Close() // Close storedSha1sumFile

    fileChangeChannel <- fileChanged // Set the fileChanged boolean to returnChannel
}

// #region Recursive function for finding all the files in a directory of a given type

func recursiveFileFetching(contentType, directory string) []string {
    // #region ContentType To Extension
    var contentTypeExt string

    if contentType != "typescript" { // If the contentType is not Typescript
        contentTypeExt = contentType // Define the contentTypeExt as the contentType itself (html, less, go)
    } else { // If the contentType IS typescript
        contentTypeExt = "ts" // Defule contentTypeExt as typescript
    }

    // #endregion

    recursiveFilesSlice := []string{}

    // #region Get Directory Entries
    directoryHandler, _ := os.Open(directory) // Open the directory and return an os.File
    innerDirectoryEntries, _ := directoryHandler.Readdir(0) // Get the directory entries of src/contentType (+directory) as an array of os.FileInfo interfaces

    for _, potentialFile := range innerDirectoryEntries { // For each potentialFile in directoryEntries
        fileOrDirName := potentialFile.Name() // Define fileOrDirName as this potentialFile (or dir) name
        if potentialFile.IsDir() == false { // If the potentialFile is not a directory
            if strings.Replace(filepath.Ext(fileOrDirName), ".", "", -1) == contentTypeExt { // If the file's extension matches the one we are looking for
                recursiveFilesSlice = append(recursiveFilesSlice, directory + "/" + fileOrDirName) // Add the file's name (with full path) to recursiveFilesSlice array
            }
        } else { // If the potentialFile is actually a directory
            innerDirectoryFiles := recursiveFileFetching(contentType, directory + "/" + fileOrDirName) // Recursively fetch the inner directory files
            recursiveFilesSlice = append(recursiveFilesSlice, innerDirectoryFiles...) // Append all the innerDirectoryFile entries
        }
    }

    return recursiveFilesSlice
}

// #endregion

// #region Function to read the entire contents of the os.File passed


func ReadFullFile(file *os.File) []byte {
    var fileContent []byte // Define fileContent as a byte array

    fileStats, _ := file.Stat() // Get file statistics
    fileSize := fileStats.Size() // Get the file size

    fileContent = make([]byte, fileSize) // Set fileContent to be the byte length of fileSize
    file.Read(fileContent) // Read the file content, set any error to err

    file.Close() // Close the file
    return fileContent
}

// #endregion

// #region Function to write or update the file contents of the passed filePath

func WriteOrUpdateFile(filePath string, fileContent []byte) {
    var file *os.File // Define file as an os.File
    file, fileCreateError := os.Create(filePath) // Create a file (or truncate if it exists), returning os.File and any error

    if fileCreateError != nil { // If there was a non-nil error passed
        os.MkdirAll(filepath.Dir(filePath), 0755) // Create the necessary directories that were in the path of filePath
        file, _ = os.Create(filePath) // Re-create the file
    }

    file.Write(fileContent) // Write the content
    file.Close() // Close the file after writing
}

// #endregion

// #region Function for executing a utility with args and returning the stringified output

func execCommand(utility string, args []string) string {
    runner := exec.Command(utility, args...)
    output, _ := runner.CombinedOutput() // Combine the output of stderr and stdout
    return string(output)
}

// #endregion

func main(){
    type config struct {
        ProjectName string
        ContentTypes    []string
        UsesTests string
    }

    configFile, configFetchErr := os.Open("build/config") // Open the build/config and assign the os.File struct to configFile and err to configFetchError

    if configFetchErr == nil { // If there was no error
        configContent  := ReadFullFile(configFile) // Read the entire contents of the configFile

        var projectConfig config // Define projectConfig as a config struct
        json.Unmarshal(configContent, &projectConfig) // Decode the JSON configContent into projectConfig (config struct)
        var lowercaseProjectName = strings.ToLower(projectConfig.ProjectName) // Lowercase the Project Name

        fmt.Println("Compiling " + projectConfig.ProjectName)

        for _, contentType := range projectConfig.ContentTypes { // For each contentType
            fmt.Println("Checking for file changes within: src/" + contentType)
            codebaseChanged := false // Define codebaseChanged as a bool, default of false
            allDirectoryFiles := recursiveFileFetching(contentType, "src/" + contentType) // Get all files in this directory of the contentType

            func(allDirectoryFiles []string) {
                lengthOfFiles := len(allDirectoryFiles) // Get the length of the slice of files
                var fileChangeChannel = make(chan int, lengthOfFiles) // Make a channel that passes bool values, max buffer of lengthOfFiles

                for _, file := range allDirectoryFiles { // For each range in
                    go fileChanged(contentType, file, fileChangeChannel) // Check if the file was changed
                }

                for {
                    select {
                        case fileChanged := <- fileChangeChannel: // If we receive a value from the returnChannel
                            if fileChanged != 0 { // If we are passed a non-zero value
                                lengthOfFiles = lengthOfFiles - 1 // Remove one from lengthOfFiles

                                if fileChanged == 2 { // If the file was changed
                                    codebaseChanged = true // Set the codebaseChanged to true
                                }

                                if lengthOfFiles == 0 { // If there are no more files to process
                                    close(fileChangeChannel) // Close the fileChangeChannel
                                    return // Exit the function
                                }
                            }
                        default: // No nothing
                    }
                }
            }(allDirectoryFiles)

            if codebaseChanged == true { // If the codebase changed
                var commandUtil string // Define commandUtil as the util we will use in the command
                commandArgs := []string{} // Define commandArgs as an empty slice of strings

                if contentType == "html" { // If the contentType is html
                    if strings.Contains(projectConfig.UsesTests, "y") == true { // If we have tests
                        fmt.Println("Copying HTML files to tests/design.")

                        for _, fileNameAndPath := range allDirectoryFiles { // For each HTML file in the src/html
                            filePath, fileName := filepath.Split(fileNameAndPath)// Get the filePath
                            testsPath := strings.Replace(filePath, "src/html", "tests/design", -1) // Replace the src/html with the tests/design so we get what the path should be for the file when it is in test

                            os.MkdirAll(testsPath, 0755) // Make the proposed path if necessary
                            htmlSrcFile, htmlSrcError := os.Open(filePath) // Use os.Open to create an os.File handler of the file

                            if htmlSrcError == nil { // If there is no error when opening the file
                                htmlContent  := ReadFullFile(htmlSrcFile) // Read the full file contents of htmlSrcFile
                                WriteOrUpdateFile(testsPath + "/" + fileName, htmlContent) // Update the tests/design/ with the src/html content
                            }
                        }
                    }
                } else if contentType == "go" { // If the contentType is go
                    commandUtil = "go" // Use go (go compiler)
                    commandArgs = append(commandArgs, "build src/go/*")
                } else if contentType == "less" { // If the contentType is less
                    commandUtil = "lessc" // Use lessc (less compiler)
                    commandArgs = append(commandArgs, "--strict-math=on", "--no-js", "--no-color", "--no-ie-compat", "--clean-css")
                    commandArgs = append(commandArgs, "src/less/" + lowercaseProjectName + ".less")
                    commandArgs = append(commandArgs, "build/" + lowercaseProjectName + ".css")
                } else if contentType == "typescript" { // If the contentType is typescript
                    commandUtil = "tsc" // Use tsc (typescript compiler)
                    commandArgs = []string{"@build/typescriptArgs.txt"}

                    if _, err := os.Stat("build/typescriptArgs.txt"); os.IsNotExist(err) { // If the typescriptArgs file does not exist
                        typescriptArgsFile, _ := os.Create("build/typescriptArgs.txt") // Create an os.File struct to write content to
                        typescriptArgsFile.WriteString("--declaration --removeComments --target ES5 src/typescript/" + lowercaseProjectName + ".ts --out build/" + lowercaseProjectName + ".js") // Write the arguments to the file
                        typescriptArgsFile.Close() // Close the file
                    }
                }

                if commandUtil != "" { // If we assigned a value to commandUtil
                    fmt.Println(strings.Title(contentType) + " files have been changed. Re-compiling.")
                    commandOutput := execCommand(commandUtil, commandArgs) // Call execCommand and get its commandOutput

                    if contentType == "go" { // If the contentType is go
                        if strings.Contains(commandOutput, lowercaseProjectName + ".go:") == true { // If running the go build shows there are obvious issues
                            fmt.Println(commandOutput)
                        } else { // IF there was no obvious issues
                            execCommand(commandUtil, []string{"install"}) // Run go but using install rather than build
                        }
                    } else if contentType == "less" { // If the contentType is less
                        if strings.Contains(commandOutput, "ParseError") == false && strings.Contains(commandOutput, "SyntaxError") == false { // If there was no parse or syntax errors in the LESS
                            cssFile, cssFileError := os.Open("build/" + lowercaseProjectName + ".css") // Use os.Open to return an os.File to the CSS file, with any necessary error @ cssFileError

                            if cssFileError == nil { // If there was no error when opening the CSS file
                                cssContent := ReadFullFile(cssFile) // Read the entire contents of the cssFile
                                WriteOrUpdateFile("tests/design/css/" + lowercaseProjectName + ".css", cssContent) // Copy to tests/design/css/lowercaseProjectName.css
                            }
                        } else {
                            fmt.Println(commandOutput);
                        }
                    } else if contentType == "typescript" { // If the contentType is typescript
                        if strings.Contains(commandOutput, "error TS") == false { // If tsc did not report any errors
                            if strings.Contains(projectConfig.UsesTests, "y") { // If we are using tests
                                jsFile, jsFileError := os.Open("build/" + lowercaseProjectName + ".js") // Use os.Open to return an os.File to the JS file, with any necessary error @ jsFileError

                                if jsFileError == nil { // If there was no error when opening the jsFile
                                    jsContent  := ReadFullFile(jsFile) // Read the entire contents of the jsFile
                                    WriteOrUpdateFile("tests/design/js/" + lowercaseProjectName + ".js", jsContent) // Write or update the tests JS file
                                }
                            }

                            fmt.Println("Minifying " + projectConfig.ProjectName + " compiled JavaScript.")

                            uglifyJsArgs := []string{} // Define uglifyJsArgs as an empty slice of strings
                            uglifyJsArgs = append(uglifyJsArgs, "build/" + lowercaseProjectName + ".js") // Add the source of what we'll minify
                            uglifyJsArgs = append(uglifyJsArgs, "--mangle --screw-ie8") // Have it mangle internal function variable names and not worry about IE8 compat
                            uglifyJsArgs = append(uglifyJsArgs, "--compress --compress sequences,conditionals,comparisons,evaluate,booleans,loops,join_vars,hoist_funs,if_return,drop_console,properties,unsafe") // Set a long list of things to modify in the source

                            uglifyJsOutput := execCommand("uglifyjs", uglifyJsArgs) // Run uglifyjs and store the output in uglifyJsOutput

                            WriteOrUpdateFile("build/" + lowercaseProjectName + ".min.js", []byte(uglifyJsOutput)) // Write or update the minified JS file content to build/
                            WriteOrUpdateFile("tests/design/js/" + lowercaseProjectName + ".min.js", []byte(uglifyJsOutput)) // Write or update the minified JS content to tests
                            execCommand("zopfli", []string{"build/" + lowercaseProjectName + ".min.js"}) // Have zopfli run and gzip the contents
                        } else{ // If tsc did report errors
                            fmt.Println(commandOutput) // Output those errors
                        }
                    }
                }
            }
        }

        fmt.Println("Compiling finished.")
    } else { // If we failed to fetch the config
        fmt.Println("Failed to find config!")
    }

}

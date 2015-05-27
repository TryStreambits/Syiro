package main

import (
    "encoding/json"
    "fmt"
    "os"
    "os/exec"
    "reflect"
    "strings"
    "path/filepath"
)

var currentDirectory , _ = os.Getwd() // Get the current working directory from os and assign it to currentDirectory

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

    type compileoptions struct {
        FileName string `json:"FileName"`
        ConfigFlags string `json:"ConfigFlags"`
    }

    type config struct {
        ProjectName string `json:"ProjectName"`
        ContentTypes    []string `json:"ContentTypes"`
        Less []compileoptions `json:"less"`
        UsesTests string `json:"UsesTests"`
    }

    configFile, configFetchErr := os.Open("build/config") // Open the build/config and assign the os.File struct to configFile and err to configFetchError

    if configFetchErr == nil { // If there was no error
        configContent  := ReadFullFile(configFile) // Read the entire contents of the configFile

        var projectConfig config // Define projectConfig as a config struct
        json.Unmarshal(configContent, &projectConfig) // Decode the JSON configContent into projectConfig (config struct)
        lowercaseProjectName := strings.ToLower(projectConfig.ProjectName) // Lowercase the Project Name

        fmt.Println("Compiling " + projectConfig.ProjectName)

        // #region Selective Content Type Compiling

        selectiveCompileTypes := os.Args[1:]

        if len(selectiveCompileTypes) == 0 { // If no arguments were provided
            selectiveCompileTypes = projectConfig.ContentTypes // Set to all the contentTypes
        }

        // #endregion

        for _, contentType := range selectiveCompileTypes { // For each contentType
            var commandUtil string // Define commandUtil as the util we will use in the command
            commandArgs := []string{} // Define commandArgs as an empty slice of strings

            fmt.Println("Compiling " + strings.Title(contentType) + ".")

            if contentType == "html" { // If the contentType is html
                if strings.Contains(projectConfig.UsesTests, "y") == true { // If we have tests
                    fmt.Println("Copying HTML files to tests/design.")
                    allDirectoryFiles := recursiveFileFetching(contentType, "src/html") // Get all the HTML files in src/html

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
                coreLESSFlags := append(commandArgs, "--glob", "--strict-math=on", "--no-js", "--no-color", "--no-ie-compat", "--clean-css")

                if projectConfig.Less == nil { // If there are no less config options
                    compileOptionArray := []compileoptions{}
                    basicCompileOption := compileoptions{}
                    basicCompileOption.FileName = lowercaseProjectName
                    compileOptionArray = append(compileOptionArray, basicCompileOption)
                    projectConfig.Less = compileOptionArray
                }

                for _, compileOptions := range projectConfig.Less { // For each compileOption in projectConfig.less
                    specificLESSFlags := []string{} // Define specificLESSFlags as a new string slice

                    if reflect.TypeOf(compileOptions.ConfigFlags).Name() == "string" {
                        specificLESSFlags = append(coreLESSFlags, compileOptions.ConfigFlags)
                    }

                    specificLESSFlags = append(specificLESSFlags, "src/less/" + lowercaseProjectName + ".less")
                    specificLESSFlags = append(specificLESSFlags, "build/" + compileOptions.FileName + ".css")
                    commandOutput := execCommand("lessc", specificLESSFlags) // Run the less compiler

                    if strings.Contains(commandOutput, "ParseError") == false && strings.Contains(commandOutput, "SyntaxError") == false { // If there was no parse or syntax errors in the LESS
                        cssFile, cssFileError := os.Open("build/" + compileOptions.FileName + ".css") // Use os.Open to return an os.File to the CSS file, with any necessary error @ cssFileError

                        if cssFileError == nil { // If there was no error when opening the CSS file
                            cssContent := ReadFullFile(cssFile) // Read the entire contents of the cssFile

                            if strings.Contains(projectConfig.UsesTests, "y") == true { // If this project uses tests
                                WriteOrUpdateFile("tests/design/css/" + compileOptions.FileName + ".css", cssContent) // Copy to tests/design/css/compileOptions.FileName.css
                            }
                        }
                    } else {
                        fmt.Println(commandOutput);
                    }
                }

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
                commandOutput := execCommand(commandUtil, commandArgs) // Call execCommand and get its commandOutput

                if contentType == "go" { // If the contentType is go

                    if strings.Contains(commandOutput, lowercaseProjectName + ".go:") == true { // If running the go build shows there are obvious issues
                        fmt.Println(commandOutput)
                    } else { // IF there was no obvious issues
                        execCommand(commandUtil, []string{"install"}) // Run go but using install rather than build
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

                        closureArgs := []string{} // Define uglifyJsArgs as an empty slice of strings
                        closureArgs = append(closureArgs, "build/syiro.js", "--compilation_level=SIMPLE_OPTIMIZATIONS", "--warning_level=QUIET") // Append syiro.js for build, SIMPLE optimizations, suppress warnings
                        closureOutput := execCommand("ccjs", closureArgs) // Run Google Closure Compiler and store the output in closureOutput

                        WriteOrUpdateFile("build/" + lowercaseProjectName + ".min.js", []byte(closureOutput)) // Write or update the minified JS file content to build/syiro.min.js
                        WriteOrUpdateFile("tests/design/js/" + lowercaseProjectName + ".min.js", []byte(closureOutput)) // Write or update the minified JS content to tests
                        execCommand("zopfli", []string{"build/" + lowercaseProjectName + ".min.js"}) // Have zopfli run and gzip the contents
                    } else{ // If tsc did report errors
                        fmt.Println(commandOutput) // Output those errors
                    }

                }
            }
        }
    } else { // If we failed to fetch the config
        fmt.Println("Failed to find config!")
    }

}

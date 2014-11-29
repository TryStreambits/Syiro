/*
    This is a module for Rocket utilities that are commonly used throughout Rocket's core code and may be useful to others.
*/

module rocket.utilities {

    // #region Seconds to "Time" Object Format - This function is responsible for calculating hours, minutes, and seconds based on seconds provided, returning them in an Object

    export function SecondsToTimeFormat(seconds : number) : Object {
        var timeObject : Object = {};

        if (seconds >= 3600){ // If there is more than 1 hour in "seconds"
            timeObject["hours"] = Number((seconds / 3600).toPrecision(1)); // Divide the seconds by 1 hour to get the number of hours (rounded down)
            timeObject["minutes"] = Number(((seconds - (3600 * timeObject["hours"])) / 60).toPrecision(1)); // Set minutes = the seconds minus by 3600 (1 hour) times number of hours, divided by 60 to get total minutes
            timeObject["seconds"] = Number((seconds - (3600 * timeObject["hours"])) - (60 * timeObject["minutes"])); // Set seconds = seconds minus by 3600 (1 hour) times number of hours, minus 60 * number of minutes
        }
        else if ((seconds >= 60) && (seconds < 3600)){ // If there is greater than 1 minute in seconds, but less than 1 hour
            timeObject["minutes"] = Number((seconds / 60).toPrecision(1)); // Set number = minutes by dividing minutes by 60 and rounding down
            timeObject["seconds"] = Number((seconds - (timeObject["minutes"] * 60))); // Set seconds = seconds divided by minutes times 60
        }
        else{ // If there is less than 1 minute of content
            timeObject["minutes"] = 0; // Set minutes to zero
            timeObject["seconds"] = seconds; // Round down the seconds
        }

        timeObject["seconds"] = Math.floor(timeObject["seconds"]); // Seconds should always round down

        for (var timeObjectKey in timeObject){ // For each key in the timeObject
            var timeObjectValue = timeObject[timeObjectKey]; // Set timeObjectValue as the value based on key
            var timeObjectValueString = timeObjectValue.toString(); // Convert the int to string

            if (timeObjectValue < 10){ // If we are dealing with an int less than 10
                timeObjectValueString = "0" + timeObjectValueString; // Prepend a 0
            }

            timeObject[timeObjectKey] = timeObjectValueString; // Set the key/val to the stringified and parsed int
        }

        return timeObject;
    }

// #endregion

}

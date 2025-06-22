//import event parameters from wherever they come from

import {makeUUID} from "@/lib/UUIDmaker.js"


export function createCalendar(eventName, eventDate, startTime, endTime, location, description)
{
    //console.log("createCalendar Fn accessed")
    function standardizeTime(date,time)
    {
        return (date+"").substring(0,4) + (date+"").substring(5,7) + (date+"").substring(8,10) + "T" + (time+"").substring(0,2) + (time+"").substring(3, 5) +"00Z";
    }

    startTime = standardizeTime(eventDate, startTime)
    endTime = standardizeTime(eventDate, endTime)
    let exportStr =
`BEGIN:VCALENDAR
VERSION:2.0
PRODID:-//appsheet.com//appsheet 1.0//EN
CALSCALE:GREGORIAN
METHOD:PUBLISH
BEGIN:VEVENT
SUMMARY:Invitation to go to ${eventName}!
UID: ${makeUUID()}
SEQUENCE:0
STATUS:CONFIRMED
TRANSP:TRANSPARENT
DTSTART:${startTime}
DTEND:${endTime}
LOCATION:${location}
DESCRIPTION:${description}
END:VEVENT
END:VCALENDAR`;
    return exportStr;
}
console.log(createCalendar("test", "20250621T100000", "20250621T120000", "test", "test"))


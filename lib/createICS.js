//import event parameters from wherever they come from


export function createCalendar(eventName, eventDate, startTime, endTime, location, description)
{
    function standardizeTime(time)
    {
        
    }

    startTime = standardizeTime(startTime)
    endTime = standardizeTime(endTime)

    let exportStr =
`BEGIN:VCALENDAR
VERSION:2.0
PRODID:-//appsheet.com//appsheet 1.0//EN
CALSCALE:GREGORIAN
METHOD:PUBLISH
BEGIN:VEVENT
SUMMARY:Invitation to go to ${eventName}!
UID:c7614cff-3549-4a00-9152-d25cc1fe077d
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


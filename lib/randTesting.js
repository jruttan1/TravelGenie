//import {makeUUID} from "@/lib/UUIDmaker"
import JSZip from "jszip";

let date = "2024-02-19";
let time = "13:00";
let time2 = "14:00";
let inviteText = `
BEGIN:VCALENDAR
VERSION:2.0
PRODID:-//appsheet.com//appsheet 1.0//EN
CALSCALE:GREGORIAN
METHOD:PUBLISH
BEGIN:VEVENT
SUMMARY:Invitation to go to Shanghai Museum!
UID: 53c5f6e5fad152e903980d944d5375a18de46e75
SEQUENCE:0
STATUS:CONFIRMED
TRANSP:TRANSPARENT
DTSTART:20250715T100000Z
DTEND:20250715T130000Z
LOCATION:201 Ren Min Da Dao, People's Square, Huang Pu Qu, China, 200003
DESCRIPTION:Explore ancient Chinese art and artifacts at the Shanghai Museum. Focus on the bronze and ceramics collections.
END:VEVENT
END:VCALENDAR`;

const zip = new JSZip();

console.log("dada");
//console.log((date+"").substring(0,4) + (date+"").substring(5,7) + (date+"").substring(8,10)+ (time+"").substring(0,2) + (time+"").substring(3, 5) +"00");

zip.file("testZip" + ".ics", inviteText);
zip.generateAsync({ type: "blob" }).then(blob => {
    
  });
  
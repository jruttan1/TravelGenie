import {makeUUID} from "@/lib/UUIDmaker"
import JSZip from "jszip";

let date = "2024-02-19";
let time = "13:00";
let time2 = "14:00";

const zip = new JSZip();

console.log("dada");
//console.log((date+"").substring(0,4) + (date+"").substring(5,7) + (date+"").substring(8,10)+ (time+"").substring(0,2) + (time+"").substring(3, 5) +"00");

//zip.file("testZip" + ".ics", createCalendar("testEvent1", date, time, time2, "321 Castlemore", "party"));
import warnings
import time
from bs4.builder import XMLParsedAsHTMLWarning

warnings.filterwarnings("ignore", category=XMLParsedAsHTMLWarning)

from bs4 import BeautifulSoup
import re
import requests

class TimeSlot:
    def __init__(self, day, startTime, endTime):
        self.day = day
        self.startTime = startTime
        self.endTime = endTime
        
    def getDay(self):
        return self.day

    def getStartTime(self):
        return self.startTime

    def getEndTime(self):
        return self.endTime
    
    def __str__(self):
        return f"Day: {self.day}, Start: {self.startTime}, End: {self.endTime}"
   

class Component:
    def __init__(self, ID, type, timeSlots, instructors):
        self.ID = ID
        self.type = type
        self.timeSlots = timeSlots 
        self.instructors = instructors
        
    def getID(self):
        return self.ID
    
    def getType(self):
        return self.type

    def getTimeSlots(self):
        return self.timeSlots

    def getInstructors(self):
        return self.instructors

class Section:
    
    def __init__(self, sectionID):
        self.sectionID = sectionID
        self.components = []  

    def getSectionID(self):
        return self.sectionID

    def addComponent(self, component): 
        self.components.append(component)  
    
    def getComponents(self):
        return self.components

    
def getCourse(courseCode: str):
    
    subject = courseCode[:3]
    course_number = courseCode[3:]

    
    session = requests.Session()
    
    initial_url = "https://uocampus.public.uottawa.ca/psc/csprpr9pub/EMPLOYEE/SA/c/UO_SR_AA_MODS.UO_PUB_CLSSRCH.GBL"
    response = session.get(initial_url)
    html_content = response.text

    soup = BeautifulSoup(html_content, "lxml")

    icsid_input = soup.select_one("input[name=ICSID]")
    if not icsid_input or not icsid_input.get("value"):
        raise ValueError("Failed to extract ICSID token.")
    icsid_token = icsid_input["value"]

    ic_state_num_input = soup.select_one("input[name=ICStateNum]")
    ic_state_num = ic_state_num_input["value"] if ic_state_num_input else "5"

    headers = {
        "Accept": "*/*",
        "Accept-Encoding": "gzip, deflate, br, zstd",
        "Connection": "keep-alive",
        "Content-Type": "application/x-www-form-urlencoded",
        "Host": "uocampus.public.uottawa.ca",
        "Origin": "https://uocampus.public.uottawa.ca",
        "Referer": initial_url,
    }

    data = {
        "ICAJAX": "1",
        "ICNAVTYPEDROPDOWN": "0",
        "ICType": "Panel",
        "ICElementNum": "0",
        "ICStateNum": ic_state_num,
        "ICAction": "CLASS_SRCH_WRK2_SSR_PB_CLASS_SRCH",
        "ICSID": icsid_token,  
        "CLASS_SRCH_WRK2_STRM$35$": "2251",  
        "SSR_CLSRCH_WRK_SUBJECT$0": subject.upper(),
        "SSR_CLSRCH_WRK_SSR_EXACT_MATCH1$0": "E",
        "SSR_CLSRCH_WRK_CATALOG_NBR$0": course_number,
        "SSR_CLSRCH_WRK_SSR_OPEN_ONLY$chk$0": "N",
    }

    response = session.post(initial_url, headers=headers, data=data, cookies=session.cookies.get_dict())
    return getCourseInfo(response.text)

def getCourseInfo(html):
    soup = BeautifulSoup(html,"lxml")
    i = 0
    sectionsMap = {}  

    while soup.find(id="MTG_CLASSNAME$" + str(i)):
        sectionIdAndComponentTypeElem = soup.find(id="MTG_CLASSNAME$" + str(i))
        timesElem = soup.find(id="MTG_DAYTIME$" + str(i))
        instructorElem = soup.find(id="MTG_INSTR$" + str(i))

        sectionID = getSectionID(sectionIdAndComponentTypeElem)
        componentID = getComponentID(sectionIdAndComponentTypeElem)
        componentType = getComponentType(sectionIdAndComponentTypeElem)
        timeSlots = getTimeSlots(timesElem)
        instructors = getInstructors(instructorElem)
        component = Component(componentID, componentType, timeSlots, instructors)

        if sectionID in sectionsMap:
            sectionsMap[sectionID].addComponent(component)
        else:
            new_section = Section(sectionID)
            new_section.addComponent(component)
            sectionsMap[sectionID] = new_section

        i += 1

    sections = list(sectionsMap.values())
    return JSONOutput(sections)

def getSectionID(element):
    return element.get_text(strip=True)[0]

def getComponentID(element):
    return element.get_text(strip=True)[:3]

def getComponentType(element):
    return element.get_text(strip=True)[4:7]
    
def getTimeSlots(element):
    text = re.sub(r"<br\s*/?>", "#", element.decode_contents())
    slots = text.split("#")
    timeSlots = []
    for entry in slots:
        day, timeRange = entry.split(' ', 1)
        startTime, endTime = timeRange.split(' - ')
        timeSlots.append(TimeSlot(day.strip(), startTime.strip(), endTime.strip()))
    return timeSlots
         
def getInstructors(element):
    
    text = re.sub(r"<br\s*/?>", "#", element.decode_contents())
    return list(set(text.split("#")))

def JSONOutput(sections):
    try:
        data = {
            "sections": [
                {
                    "sectionID": section.getSectionID(),
                    "instructor": getInstructor(section),
                    "components": [
                        {
                            "ID": component.getID(),
                            "type": component.getType(),
                            "timeSlots": [
                                {
                                    "day": timeSlot.getDay(),
                                    "startTime": timeSlot.getStartTime(),
                                    "endTime": timeSlot.getEndTime()
                                } for timeSlot in component.getTimeSlots()
                            ],
                            "instructors": component.getInstructors()
                        } for component in section.getComponents()
                    ]
                } for section in sections
            ]
        }
        return data 
    except Exception as e:
        return {"error": "An error occurred while generating JSON.", "message": str(e)}

def getInstructor(section):
    if not section or not section.getComponents():
        return "N/A"

    for component in section.getComponents():
        if component.getType().upper() == "LEC":  
            instructors = component.getInstructors()
            if instructors:  
                for instructor in instructors:
                    if instructor and instructor != "Staff":  
                        return instructor
    return "N/A"


const Constants = {

    SENIORITYLEVELS : ["Beginner","Trainee", "Junior", "Proficient", "Senior", "Expert","Master", "Staff"],
    PRACTICE : ["AMS","IM","Digital","ERP","App Dev","ITIS","QA"],

    PRACTICES :[
                {PracticeID:90716 , Name: "DIGITAL"},
                {PracticeID:90701 , Name: "APP DEV"},
                {PracticeID:90702 , Name: "AMS"},
                {PracticeID:90709 , Name: "ITIS"},
                {PracticeID:90705 , Name: "QA&VALIDAT"},
                {PracticeID:1 , Name: "STAFF"},
                {PracticeID:90704 , Name: "IM"}
        ],

    COST_OPTIONS:[
        {CID: 1, Cost_Name:"Airfare"},
        {CID: 2, Cost_Name:"Bonus"},
        {CID: 3, Cost_Name:"Car"},
        {CID: 4, Cost_Name:"Hotel"},
        {CID: 5, Cost_Name:"Mobile"},
        {CID: 6, Cost_Name:"Perdiem"},
        {CID: 7, Cost_Name:"Training"},
    ],
    

    SOW_TYPE : ["Managed Services","Managed Capacity","Staff Augmentation"],
    RECORD_TYPE: ["Revenue","Cost"],
    COLOR_OF_MONEY: ["Backlog","Plan","Actual","Forecast","Prospect"],

    MONTHS : ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"],

    COMPANIES : [
        {CompanyID: 1015, Name: "MEX - BFS Ing Aplicada SA de CV", Country: "Mexico" }, 
        {CompanyID: 1051, Name: "USA - Softtek India Pvt Ltd", Country: "India" },
        {CompanyID: 1030, Name: "COL - Softtek  Renovation Ltda.", Country: "Colombia" },	
        {CompanyID: 1019, Name: "USA - Softtek Integration Systems", Country: "USA" },
    ],

    INFRASTRUCTURE :[
        {Country: "Mexico", Cost: 157.3 },
        {Country: "India", Cost: 157.3 },
        {Country: "Colombia", Cost: 157.3 },
        {Country: "USA", Cost: 157.3 },
    ],

    DMS : [
        {DMID: 19 , DMName: "Fernando Lopez"},
        {DMID: 73 , DMName: "Christopher Alonso Stiker"},
        {DMID: 2 , DMName: "Raphael Barrios"},  
    ]

  
}



export default Constants;
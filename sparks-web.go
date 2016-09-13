package main

import (
    "encoding/json"
    "html/template"
    "io/ioutil"
    "log"
    "net/http"
    "path"
    "strconv"
    "time"
    "strings"
    
    "github.com/gorilla/context"
    "github.com/gorilla/sessions"
    "github.com/husobee/vestigo"
    "gopkg.in/mgo.v2/bson"
)

type Page struct {
    Name string
}

type Error struct {
    Code    int    `json:"code"`
    Message string `json:"message"`
}

const (
    errorStatusCode = 398
    serverName = "GWS"
)

var store = sessions.NewCookieStore([]byte("something-very-secret"))

func main() {
    router := vestigo.NewRouter()

    // set up router global CORS policy
    router.SetGlobalCors(&vestigo.CorsAccessControl{
        AllowOrigin:      []string{"*"},
        AllowCredentials: false,
        MaxAge:           3600 * time.Second,
    })

    // router.Get("/sandbox/*", staticFile)
    
    fileServerAssets := http.FileServer(http.Dir("assets"))
    router.Get("/assets/*", func(w http.ResponseWriter, r *http.Request) {
        w.Header().Set("Vary", "Accept-Encoding")
        w.Header().Set("Cache-Control", "public, max-age=86400")
        w.Header().Set("Server", serverName)
        r.URL.Path = strings.TrimPrefix(r.URL.Path, "/assets")
        fileServerAssets.ServeHTTP(w, r)
    })
    
    fileServerImages := http.FileServer(http.Dir("images"))
    router.Get("/images/*", func(w http.ResponseWriter, r *http.Request) {
        w.Header().Set("Vary", "Accept-Encoding")
        w.Header().Set("Cache-Control", "public, max-age=86400")
        w.Header().Set("Server", serverName)
        r.URL.Path = strings.TrimPrefix(r.URL.Path, "/images")
        fileServerImages.ServeHTTP(w, r)
    })
    
    fileServerSandbox := http.FileServer(http.Dir("sandbox"))
    router.Get("/sandbox/*", func(w http.ResponseWriter, r *http.Request) {
        w.Header().Set("Vary", "Accept-Encoding")
        w.Header().Set("Cache-Control", "public, max-age=86400")
        w.Header().Set("Server", serverName)
        r.URL.Path = strings.TrimPrefix(r.URL.Path, "/sandbox")
        fileServerSandbox.ServeHTTP(w, r)
    })
    
    // resume
    router.Get("/viewResumeJSON/:resumeID", viewResumeJSON)
    
    // login & logout
    router.Post("/checkLoginInfoJSON", checkLoginInfoJSON)
    router.Get("/logoutJSON", logoutJSON)
    
    // dashboard
    router.Get("/loadDashboardResumesJSON", loadDashboardResumesJSON)
    router.Get("/loadDashboardPortfoliosJSON", loadDashboardPortfoliosJSON)
    router.Get("/loadSettingsJSON", loadSettingsJSON)
    
    // resume
    router.Get("/loadResumeJSON/:resumeID", loadResumeJSON)
    router.Post("/insertResumeJSON/:category", insertResumeJSON)
    router.Post("/updateResumeJSON/:category/:resumeID", updateResumeJSON)
    router.Delete("/deleteResumeJSON/:resumeID", deleteResumeJSON)
    
    // portfolio
    router.Get("/loadPortfolioJSON/:portfolioID", loadPortfolioJSON)
    router.Post("/insertPortfolioJSON/:category", insertPortfolioJSON)
    router.Post("/updatePortfolioJSON/:category/:portfolioID", updatePortfolioJSON)
    router.Delete("/deletePortfolioJSON/:portfolioID", deletePortfolioJSON)
    
    // user
    router.Post("/insertUserJSON", insertUserJSON)
    router.Post("/updateUserJSON", updateUserJSON)
    router.Delete("/deleteUserJSON", deleteUserJSON)
    
    // view
    router.Get("/user/resume/-1", viewUser)
    router.Get("/user/resume/:resumeID", viewUser)
    router.Get("/user/resumes", viewUser)
    router.Get("/user/portfolios", viewUser)
    router.Get("/user/settings", viewUser)
    router.Get("/login", viewLogin)
    router.Get("/resume/:resumeID", viewResume)
    router.Get("/", viewIndex)
   
    log.Println("Listening...")
    if err := http.ListenAndServe(":4242", context.ClearHandler(router)); err != nil {
        log.Println(err)
    }
}

/*
  ========================================
  View
  ========================================
*/

func viewIndex(w http.ResponseWriter, r *http.Request) {
    returnCode := 0

    setHeader(w)
    var homepage Page // placeholder, not used right now
    
    layout := path.Join("templates", "index.html")
    content := path.Join("templates", "content.html")
    
    tmpl, err := template.ParseFiles(layout, content)
    if err != nil {
        returnCode = 1
    }

    if returnCode == 0 {
        if err := tmpl.ExecuteTemplate(w, "my-template", homepage); err != nil {
            returnCode = 2
        }
    }
    
    // error handling
    if returnCode != 0 {
        handleError(returnCode, errorStatusCode, "Index page could not be loaded at this time.", w)
    }
}

func viewResume(w http.ResponseWriter, r *http.Request) {
    returnCode := 0

    setHeader(w)
    var homepage Page // placeholder, not used right now
    
    layout := path.Join("templates", "resume.html")
    content := path.Join("templates", "content.html")
    
    tmpl, err := template.ParseFiles(layout, content)
    if err != nil {
        returnCode = 1
    }

    if returnCode == 0 {
        if err := tmpl.ExecuteTemplate(w, "my-template", homepage); err != nil {
            returnCode = 2
        }
    }
    
    // error handling
    if returnCode != 0 {
        handleError(returnCode, errorStatusCode, "Resume page could not be loaded at this time.", w)
    }
}

func viewLogin(w http.ResponseWriter, r *http.Request) {
    returnCode := 0
    
    setHeader(w)
    var homepage Page // placeholder, not used right now
    
    layout := path.Join("templates", "login.html")
    content := path.Join("templates", "content.html")
    
    tmpl, err := template.ParseFiles(layout, content)
    if err != nil {
        returnCode = 1
    }

    if returnCode == 0 {
        if err := tmpl.ExecuteTemplate(w, "my-template", homepage); err != nil {
            returnCode = 2
        }
    }

    // error handling
    if returnCode != 0 {
        handleError(returnCode, errorStatusCode, "Login page could not be loaded at this time.", w)
    }
}

func viewUser(w http.ResponseWriter, r *http.Request) {
    returnCode := 0
    
    if uID, err := readSession("userID", w, r); err == nil && uID != nil {
        setHeader(w)
        var homepage Page // placeholder, not used right now
        var tmpl *template.Template

        layout := path.Join("templates", "user.html")
        content := path.Join("templates", "content.html")

        if tmpl, err = template.ParseFiles(layout, content); err != nil {
            returnCode = 1
        }

        if returnCode == 0 {
            if err = tmpl.ExecuteTemplate(w, "my-template", homepage); err != nil {
                returnCode = 2
            }
        }
        
        // error handling
        if returnCode != 0 {
            handleError(returnCode, errorStatusCode, "User page could not be loaded at this time.", w)
        }
    } else {
        http.Redirect(w, r, "/login", 302)
    }
}

/*
  ========================================
  Resume
  ========================================
*/

func viewResumeJSON(w http.ResponseWriter, r *http.Request) {
    returnCode := 0
    
    resume := new(Resume)    
    resumeID := vestigo.Param(r, "resumeID")

    selector := bson.M{"resumeid": resumeID}

    if err := loadResumeDB(resume, &selector); err != nil {
        returnCode = 1
    }

    if returnCode == 0 {
        if err := json.NewEncoder(w).Encode(resume); err != nil {
            returnCode = 2
        }
    }

    // error handling
    if returnCode != 0 {
        handleError(returnCode, errorStatusCode, "Resume could not be loaded at this time.", w)
    }
}

/*
  ========================================
  Login & Logout
  ========================================
*/

func checkLoginInfoJSON(w http.ResponseWriter, r *http.Request) {
    var err error
    returnCode := 0

    user := new(User)
    userID := ""
    
    if err = json.NewDecoder(r.Body).Decode(user); err != nil {
        returnCode = 1
    }
    
    if returnCode == 0 {
        if userID, err = checkPasswordDB(user.Email, user.Password); err != nil {
            returnCode = 2
        }
    }
    
    if returnCode == 0 {
        if userID != "-1" { // if password is correct, then create session
            if err = writeSession("userID", userID, w, r); err != nil {
                returnCode = 3
            }
        }
    }
    
    if returnCode == 0 {
        if err = json.NewEncoder(w).Encode(userID); err != nil {
            returnCode = 4
        }
    }
    
    // error handling
    if returnCode != 0 {
        handleError(returnCode, errorStatusCode, "Incorrect email.", w)
    }
}

func logoutJSON(w http.ResponseWriter, r *http.Request) {
    returnCode := 0
    
    if err := deleteSession(w, r); err != nil {
        returnCode = 1
    }

    if returnCode == 0 {
        if err := json.NewEncoder(w).Encode("logout"); err != nil {
            returnCode = 2
        }
    }
    
    // error handling
    if returnCode != 0 {
        handleError(returnCode, errorStatusCode, "Logout could not be completed at this time.", w)
    }
}

func readSession(key string, w http.ResponseWriter, r *http.Request) (interface{}, error) {
    session, err := store.Get(r, "user-session")
    
    session.Options.MaxAge = 3600 // one hour
    err = session.Save(r, w)
    
    return session.Values[key], err
}

func writeSession(key string, value interface{}, w http.ResponseWriter, r *http.Request) error {
    session, err := store.Get(r, "user-session")
    
    session.Options.MaxAge = 3600 // one hour
    session.Values[key] = value
    err = session.Save(r, w)
    
    return err
}

func deleteSession(w http.ResponseWriter, r *http.Request) error {
    session, err := store.Get(r, "user-session")
    
    session.Options.MaxAge = -1 // delete now
    err = session.Save(r, w)
    
    return err
}

/*
  ========================================
  Dashboard
  ========================================
*/

func loadDashboardResumesJSON(w http.ResponseWriter, r *http.Request) {
    returnCode := 0
    
    if uID, err := readSession("userID", w, r); err == nil && uID != nil {
        user := new(User)
        user.UserID = uID.(string)

        if err = loadDashboardResumesDB(user); err != nil {
            returnCode = 1
        }

        if returnCode == 0 {
            if err = json.NewEncoder(w).Encode(user); err != nil {
                returnCode = 2
            }
        }
        
        // error handling
        if returnCode != 0 {
            handleError(returnCode, errorStatusCode, "Dashboard resumes could not be loaded at this time.", w)
        }
    } else {
        handleError(3, 403, "Session expired. Please sign in again.", w)
    }
}

func loadDashboardPortfoliosJSON(w http.ResponseWriter, r *http.Request) {
    returnCode := 0

    if uID, err := readSession("userID", w, r); err == nil && uID != nil {
        user := new(User)
        user.UserID = uID.(string)

        if err = loadDashboardPortfoliosDB(user); err != nil {
            returnCode = 1
        }

        if returnCode == 0 {
            if err = json.NewEncoder(w).Encode(user); err != nil {
                returnCode = 2
            }
        }
        
        // error handling
        if returnCode != 0 {
            handleError(returnCode, errorStatusCode, "Dashboard portfolios could not be loaded at this time.", w)
        }
    } else {
        handleError(3, 403, "Session expired. Please sign in again.", w)
    }
}

func loadSettingsJSON(w http.ResponseWriter, r *http.Request) {
    returnCode := 0
    
    if uID, err := readSession("userID", w, r); err == nil && uID != nil {
        user := new(User)
        user.UserID = uID.(string)

        if err = loadSettingsDB(user); err != nil {
            returnCode = 1
        }

        if returnCode == 0 {
            if err = json.NewEncoder(w).Encode(user); err != nil {
                returnCode = 2
            }
        }

        // error handling
        if returnCode != 0 {
            handleError(returnCode, errorStatusCode, "Settings could not be loaded at this time.", w)
        }
    } else {
        handleError(3, 403, "Session expired. Please sign in again.", w)
    }
}

/*
  ========================================
  Resume
  ========================================
*/

func loadResumeJSON(w http.ResponseWriter, r *http.Request) {
    returnCode := 0
    
    if uID, err := readSession("userID", w, r); err == nil && uID != nil {
        resume := new(Resume)    
        resumeID := vestigo.Param(r, "resumeID")
        userID := uID.(string)

        if resumeID != "-1" { // existing resume
            selector := bson.M{"resumeid": resumeID, "userid": userID}

            if err = loadResumeDB(resume, &selector); err != nil {
                returnCode = 1
            }
        } else { // new resume
            resume.ResumeID = "-1"
            resume.Title = "Untitled Resume"
        }

        if returnCode == 0 {
            if err = json.NewEncoder(w).Encode(resume); err != nil {
                returnCode = 2
            }
        }

        // error handling
        if returnCode != 0 {
            handleError(returnCode, errorStatusCode, "Resume could not be loaded at this time.", w)
        }
    } else {
        handleError(3, 403, "Session expired. Please sign in again.", w)
    }
}

func insertResumeJSON(w http.ResponseWriter, r *http.Request) {
    returnCode := 0
    
    if uID, err := readSession("userID", w, r); err == nil && uID != nil {
        categoryInt := 0
        resume := new(Resume)
        resume.UserID = uID.(string)
        user := new(User)
        user.UserID = uID.(string)
        // **** add first name and last name to resume.contact section ****

        categoryStr := vestigo.Param(r, "category") // 1 = general | 2 = profile | 3 = experience | 4 = skills | 5 = portfolio | 6 = otherInfo | 7 = contactInfo

        if categoryInt, err = strconv.Atoi(categoryStr); err != nil {
            returnCode = 1
        }

        if returnCode == 0 {
            if resume.ResumeID, err = insertResumeDB(resume.UserID); err != nil { // Step 1
                returnCode = 2
            }
        }

        if returnCode == 0 {
            if err = insertUResume(resume.UserID, resume.ResumeID); err != nil { // Step 2
                returnCode = 3
            }
        }

        if returnCode == 0 {
            if err = updateResume(categoryInt, resume, r); err != nil { // Step 3
                returnCode = 4
            }
        }

        if returnCode == 0 {
            if err = loadSettingsDB(user); err != nil { // Step 4
                returnCode = 5
            }
        }

        if returnCode == 0 {
            if err = updateRContactTypeName(user.UserID, user.FirstName, user.LastName); err != nil { // Step 5
                returnCode = 6
            }
        }

        if returnCode == 0 {
            if err = json.NewEncoder(w).Encode(resume); err != nil {
                returnCode = 7
            }
        }

        // error handling
        if returnCode != 0 {
            handleError(returnCode, errorStatusCode, "Resume could not be inserted at this time.", w)
        }
    } else {
        handleError(3, 403, "Session expired. Please sign in again.", w)
    }
}

func updateResumeJSON(w http.ResponseWriter, r *http.Request) {
    returnCode := 0
    
    if uID, err := readSession("userID", w, r); err == nil && uID != nil {
        categoryInt := 0
        resume := new(Resume)
        resume.UserID = uID.(string)

        categoryStr := vestigo.Param(r, "category")
        /*
        1 = settings

        2 = profileType
        3 = experienceType
        4 = skillsType
        5 = portfolioType
        6 = otherInfoType
        7 = contactInfoType

        8 = experiences
        9 = skills
        */

        if categoryInt, err = strconv.Atoi(categoryStr); err != nil {
            returnCode = 1
        }

        if returnCode == 0 {
            resume.ResumeID = vestigo.Param(r, "resumeID")

            if err = updateResume(categoryInt, resume, r); err != nil {
                returnCode = 2
            }
        }

        if returnCode == 0 {
            if err = json.NewEncoder(w).Encode(resume); err != nil {
                returnCode = 3
            }
        }

        // error handling
        if returnCode != 0 {
            handleError(returnCode, errorStatusCode, "Resume could not be updated at this time.", w)
        }
    } else {
        handleError(3, 403, "Session expired. Please sign in again.", w)
    }
}

func updateResume(categoryInt int, resume *Resume, r *http.Request) error {
    var err error

    switch categoryInt {
        case 1:
            // part 1: update resume settings

            err = json.NewDecoder(r.Body).Decode(resume)
            logErrorMessage(err)

            resume.TitleURL = getTitleURL(resume.Title)
            resume.LinkURL = getLinkURL(resume.Title)

            err = updateRSettings(resume.ResumeID, resume.UserID, resume)
            logErrorMessage(err)

            // part 2: update user resume

            basicResume := new(BasicResume)

            basicResume.ResumeID = resume.ResumeID
            basicResume.Title = resume.Title
            
            err = updateUResume(resume.UserID, basicResume)
            logErrorMessage(err)
        case 2:
            profile := new(ProfileType)

            err = json.NewDecoder(r.Body).Decode(profile)
            logErrorMessage(err)

            // profile.Background = new(Image)

            err = updateRProfileType(resume.ResumeID, resume.UserID, profile)
            logErrorMessage(err)

            resume.Profile = *profile
        case 3:
            experience := new(ExperienceType)
            
            err = json.NewDecoder(r.Body).Decode(experience)
            logErrorMessage(err)
            
            // experience.Background = new(Image)
            
            err = updateRExperienceType(resume.ResumeID, resume.UserID, experience)
            logErrorMessage(err)
            
            resume.Experience = *experience
        case 4:
            skills := new(SkillsType)
            
            err = json.NewDecoder(r.Body).Decode(skills)
            logErrorMessage(err)
            
            // skills.Background = new(Image)

            err = updateRSkillsType(resume.ResumeID, resume.UserID, skills)
            logErrorMessage(err)

            resume.Skills = *skills
        case 5:
            updateRPortfolioType()
        case 6:
            updateROtherInfoType()
        case 7:
            contact := new(ContactType)

            err = json.NewDecoder(r.Body).Decode(contact)
            logErrorMessage(err)

            // contactInfo.Background = new(Image)

            err = updateRContactType(resume.ResumeID, resume.UserID, contact)
            logErrorMessage(err)

            resume.Contact = *contact
        case 8:
            var experiences []Experience
            var byteSlice []byte
            
            // https://golang.org/pkg/io/ioutil/#ReadAll
            byteSlice, err = ioutil.ReadAll(r.Body)
            logErrorMessage(err)
            
            // https://golang.org/pkg/encoding/json/#Unmarshal
            err = json.Unmarshal(byteSlice, &experiences)
            logErrorMessage(err)
            
            err = updateRExperiences(resume.ResumeID, resume.UserID, &experiences)
            logErrorMessage(err)
            
            resume.Experience.Experiences = experiences
        case 9:
            var skills []Skill
            var byteSlice []byte

            // https://golang.org/pkg/io/ioutil/#ReadAll
            byteSlice, err = ioutil.ReadAll(r.Body)
            logErrorMessage(err)
            
            // https://golang.org/pkg/encoding/json/#Unmarshal
            err = json.Unmarshal(byteSlice, &skills)
            logErrorMessage(err)
            
            err = updateRSkills(resume.ResumeID, resume.UserID, &skills)
            logErrorMessage(err)
           
            resume.Skills.Skills = skills
        default:
            log.Println("No category selected. Resume not updated.")
    }
    
    return err
}

func deleteResumeJSON(w http.ResponseWriter, r *http.Request) {
    returnCode := 0

    if uID, err := readSession("userID", w, r); err == nil && uID != nil {
        userID := uID.(string)
        resumeID := vestigo.Param(r, "resumeID")

        if err := deleteUResume(userID, resumeID); err != nil { // part 1: delete user resume info
            returnCode = 1
        }

        if returnCode == 0 {
            if err := deleteResumeDB(resumeID, userID); err != nil { // part 2: delete resume
                returnCode = 2
            }
        }

        if returnCode == 0 {
            if err := json.NewEncoder(w).Encode(""); err != nil {
                returnCode = 3
            }
        }

        // error handling
        if returnCode != 0 {
            handleError(returnCode, errorStatusCode, "Resume could not be deleted at this time.", w)
        }
    } else {
        handleError(3, 403, "Session expired. Please sign in again.", w)
    }
}

/*
  ========================================
  Portfolio
  ========================================
*/

func loadPortfolioJSON(w http.ResponseWriter, r *http.Request) {
    
    // **** EDIT ****
    
}

func insertPortfolioJSON(w http.ResponseWriter, r *http.Request) {
    
    // **** EDIT ****
    
}

func updatePortfolioJSON(w http.ResponseWriter, r *http.Request) {
    
    // **** EDIT ****
    
}

func deletePortfolioJSON(w http.ResponseWriter, r *http.Request) {

    // **** EDIT ****
    
}

/*
  ========================================
  User
  ========================================
*/

func insertUserJSON(w http.ResponseWriter, r *http.Request) {
    // **** EDIT ****
    
    userID, err := insertUserDB()
    
    err = json.NewEncoder(w).Encode(userID)
    logErrorMessage(err)
}

func updateUserJSON(w http.ResponseWriter, r *http.Request) {
    returnCode := 0

    if uID, err := readSession("userID", w, r); err == nil && uID != nil {
        user := new(User)
        user.UserID = uID.(string)

        if err := json.NewDecoder(r.Body).Decode(user); err != nil {
            returnCode = 1
        }

        if returnCode == 0 {
            if err := updateUSettings(user); err != nil {
                returnCode = 2
            }
        }

        if returnCode == 0 {
            if err := updateRContactTypeName(user.UserID, user.FirstName, user.LastName); err != nil {
                returnCode = 3
            }
        }

        if returnCode == 0 {
            if err := json.NewEncoder(w).Encode(user); err != nil {
                returnCode = 4
            }
        }

        // error handling
        if returnCode != 0 {
            handleError(returnCode, errorStatusCode, "User could not be updated at this time.", w)
        }
    } else {
        handleError(3, 403, "Session expired. Please sign in again.", w)
    }
}

func deleteUserJSON(w http.ResponseWriter, r *http.Request) {
    
    // **** EDIT ****
    
}

/*
  ========================================
  Error
  ========================================
*/

func logErrorMessage(err error) {
    if err != nil {
		log.Println(err)
	}
}

func handleError(returnCode, statusCode int, message string, w http.ResponseWriter) {
    error := new(Error)
    error.Code = returnCode
    error.Message = message

    w.WriteHeader(statusCode)
    if err := json.NewEncoder(w).Encode(error); err != nil {
        log.Println(err)
    }
}

/*
  ========================================
  Basic Functions
  ========================================
*/

func setHeader(w http.ResponseWriter) {
    w.Header().Set("Content-Type", "text/html; charset=utf-8")
    w.Header().Set("Cache-control", "no-cache, no-store, max-age=0, must-revalidate")
    w.Header().Set("Expires", "Fri, 01 Jan 1990 00:00:00 GMT")
    w.Header().Set("Server", serverName)
}

func staticFile(w http.ResponseWriter, r *http.Request) {
    w.Header().Set("Vary", "Accept-Encoding")
    w.Header().Set("Cache-Control", "public, max-age=86400")
    w.Header().Set("Server", serverName)
	http.ServeFile(w, r, r.URL.Path[1:])
}
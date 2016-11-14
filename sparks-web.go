package main

import (
	"encoding/json"
	"html/template"
	"image"
	"image/jpeg"
	"io/ioutil"
	"log"
	"net/http"
	"os"
	"path"
	"strconv"
	"strings"
	"time"

	"github.com/disintegration/imaging"
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
	serverName      = "GWS"
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

	// published
	router.Get("/viewResumeJSON/:resumeID", viewResumeJSON)
	router.Get("/viewPortfolioJSON/:portfolioID", viewPortfolioJSON)

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

	// image
	router.Post("/uploadImage/:category/:resumeID", uploadImage)

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
	router.Get("/user/portfolio/-1", viewUser)
	router.Get("/user/portfolio/:portfolioID", viewUser)
	router.Get("/user/resumes", viewUser)
	router.Get("/user/portfolios", viewUser)
	router.Get("/user/settings", viewUser)
	router.Get("/login", viewLogin)
	router.Get("/resume/:resumeID", viewResume)
	router.Get("/portfolio/:portfolioID", viewPortfolio)
	router.Get("/", viewIndex)

	log.Println("Listening...")
	if err := http.ListenAndServe(":4242", context.ClearHandler(router)); err != nil {
		log.Println(err)
	}
}

/*
  ========================================
  View Admin
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

func viewPortfolio(w http.ResponseWriter, r *http.Request) {
	returnCode := 0

	setHeader(w)
	var homepage Page // placeholder, not used right now

	layout := path.Join("templates", "portfolio.html")
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
		handleError(returnCode, errorStatusCode, "Portfolio page could not be loaded at this time.", w)
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
  View
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

func viewPortfolioJSON(w http.ResponseWriter, r *http.Request) {
	returnCode := 0

	portfolio := new(Portfolio)
	portfolioID := vestigo.Param(r, "portfolioID")

	selector := bson.M{"portfolioid": portfolioID}

	if err := loadPortfolioDB(portfolio, &selector); err != nil {
		returnCode = 1
	}

	if returnCode == 0 {
		if err := json.NewEncoder(w).Encode(portfolio); err != nil {
			returnCode = 2
		}
	}

	// error handling
	if returnCode != 0 {
		handleError(returnCode, errorStatusCode, "Portfolio could not be loaded at this time.", w)
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
		   10 = portfolios
		   11 = educations
		   12 = qualifications
		   13 = awards
		*/

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
		   10 = portfolios
		   11 = educations
		   12 = qualifications
		   13 = awards
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

		if err := json.NewDecoder(r.Body).Decode(resume); err != nil {
			log.Println("update resume error 1.1:", err)
		}

		resume.TitleURL = getTitleURL(resume.Title)
		resume.LinkURL = getLinkURL(resume.Title)

		if err := updateRSettings(resume.ResumeID, resume.UserID, resume); err != nil {
			log.Println("update resume error 1.2:", err)
		}

		// part 2: update user resume

		basicResume := new(BasicResume)

		basicResume.ResumeID = resume.ResumeID
		basicResume.Title = resume.Title

		if err := updateUResume(resume.UserID, basicResume); err != nil {
			log.Println("update resume error 1.3:", err)
		}
	case 2:
		profile := new(ProfileType)

		if err := json.NewDecoder(r.Body).Decode(profile); err != nil {
			log.Println("update resume error 2.1:", err)
		}

		// profile.Background = new(Image)

		if err := updateRProfileType(resume.ResumeID, resume.UserID, profile); err != nil {
			log.Println("update resume error 2.2:", err)
		}

		resume.Profile = *profile
	case 3:
		experience := new(ExperienceType)

		if err := json.NewDecoder(r.Body).Decode(experience); err != nil {
			log.Println("update resume error 3.1:", err)
		}

		// experience.Background = new(Image)

		if err := updateRExperienceType(resume.ResumeID, resume.UserID, experience); err != nil {
			log.Println("update resume error 3.2:", err)
		}

		resume.Experience = *experience
	case 4:
		skills := new(SkillsType)

		if err := json.NewDecoder(r.Body).Decode(skills); err != nil {
			log.Println("update resume error 4.1:", err)
		}

		// skills.Background = new(Image)

		if err := updateRSkillsType(resume.ResumeID, resume.UserID, skills); err != nil {
			log.Println("update resume error 4.2:", err)
		}

		resume.Skills = *skills
	case 5:
		updateRPortfolioType()
	case 6:
		updateRAchievementsType()
	case 7:
		contact := new(ContactType)

		if err := json.NewDecoder(r.Body).Decode(contact); err != nil {
			log.Println("update resume error 7.1:", err)
		}

		// contactInfo.Background = new(Image)

		if err := updateRContactType(resume.ResumeID, resume.UserID, contact); err != nil {
			log.Println("update resume error 7.2:", err)
		}

		resume.Contact = *contact
	case 8:
		var experiences []Experience
		var byteSlice []byte

		// https://golang.org/pkg/io/ioutil/#ReadAll
		if byteSlice, err = ioutil.ReadAll(r.Body); err != nil {
			log.Println("update resume error 8.1:", err)
		}

		// https://golang.org/pkg/encoding/json/#Unmarshal
		if err := json.Unmarshal(byteSlice, &experiences); err != nil {
			log.Println("update resume error 8.2:", err)
		}

		if err := updateRExperiences(resume.ResumeID, resume.UserID, &experiences); err != nil {
			log.Println("update resume error 8.3:", err)
		}

		resume.Experience.Experiences = experiences
	case 9:
		var skills []Skill
		var byteSlice []byte

		// https://golang.org/pkg/io/ioutil/#ReadAll
		if byteSlice, err = ioutil.ReadAll(r.Body); err != nil {
			log.Println("update resume error 9.1:", err)
		}

		// https://golang.org/pkg/encoding/json/#Unmarshal
		if err := json.Unmarshal(byteSlice, &skills); err != nil {
			log.Println("update resume error 9.2:", err)
		}

		if err := updateRSkills(resume.ResumeID, resume.UserID, &skills); err != nil {
			log.Println("update resume error 9.3:", err)
		}

		resume.Skills.Skills = skills
	case 10:
		log.Println("10: portfolios")
	case 11:
		var educations []Education
		var byteSlice []byte

		// https://golang.org/pkg/io/ioutil/#ReadAll
		if byteSlice, err = ioutil.ReadAll(r.Body); err != nil {
			log.Println("update resume error 11.1:", err)
		}

		// https://golang.org/pkg/encoding/json/#Unmarshal
		if err := json.Unmarshal(byteSlice, &educations); err != nil {
			log.Println("update resume error 11.2:", err)
		}

		if err := updateREducations(resume.ResumeID, resume.UserID, &educations); err != nil {
			log.Println("update resume error 11.3:", err)
		}

		resume.Achievements.Educations = educations
	case 12:
		var qualifications []Qualification
		var byteSlice []byte

		// https://golang.org/pkg/io/ioutil/#ReadAll
		if byteSlice, err = ioutil.ReadAll(r.Body); err != nil {
			log.Println("update resume error 12.1:", err)
		}

		// https://golang.org/pkg/encoding/json/#Unmarshal
		if err := json.Unmarshal(byteSlice, &qualifications); err != nil {
			log.Println("update resume error 12.2:", err)
		}

		if err := updateRQualifications(resume.ResumeID, resume.UserID, &qualifications); err != nil {
			log.Println("update resume error 12.3:", err)
		}

		resume.Achievements.Qualifications = qualifications
	case 13:
		var awards []Award
		var byteSlice []byte

		// https://golang.org/pkg/io/ioutil/#ReadAll
		if byteSlice, err = ioutil.ReadAll(r.Body); err != nil {
			log.Println("update resume error 13.1:", err)
		}

		// https://golang.org/pkg/encoding/json/#Unmarshal
		if err := json.Unmarshal(byteSlice, &awards); err != nil {
			log.Println("update resume error 13.2:", err)
		}

		if err := updateRAwards(resume.ResumeID, resume.UserID, &awards); err != nil {
			log.Println("update resume error 13.3:", err)
		}

		resume.Achievements.Awards = awards
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
			w.Write([]byte(resumeID))
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
  Image
  ========================================
*/

func uploadImage(w http.ResponseWriter, r *http.Request) {
	returnCode := 0

	if uID, err := readSession("userID", w, r); err == nil && uID != nil {
		categoryStr := vestigo.Param(r, "category")
		resumeID := vestigo.Param(r, "resumeID")
		userID := uID.(string)
		var fileName string

		categoryInt, err := strconv.Atoi(categoryStr)
		if err != nil {
			returnCode = 1
		}

		if returnCode == 0 {
			if fileName, err = processImage(r, categoryInt, resumeID, userID); err != nil { // save image in folder
				returnCode = 2
			}
		}

		if returnCode == 0 {
			w.Write([]byte(fileName))
		}

		// error handling
		if returnCode != 0 {
			handleError(returnCode, errorStatusCode, "Image could not be uploaded at this time.", w)
		}
	} else {
		handleError(3, 403, "Session expired. Please sign in again.", w)
	}
}

func processImage(r *http.Request, categoryInt int, resumeID, userID string) (string, error) {
	var err error

	fileName := time.Now().Format("20060102150405") + ".jpg"

	file, _, err := r.FormFile("uploadFile")
	defer file.Close()
	if err != nil {
		log.Println("process image error 1:", err)
	}

	originalImage, _, err := image.Decode(file) // decode file
	if err != nil {
		log.Println("process image error 2:", err)
	}

	switch categoryInt {
	case 1: // profile
		/*
		  ========================================
		  Large Image
		  ========================================
		*/

		// Step 1: Resize image to width = 1200 px.
		largeFilePath := "./images/profile/large/"
		imageLarge := imaging.Resize(originalImage, 1200, 0, imaging.Linear)

		// Step 2: Save image in directory.
		largeFile, err := os.Create(largeFilePath + fileName)
		defer largeFile.Close()
		if err != nil {
			log.Println("process image error 3:", err)
		}

		// Step 3: Compress image.
		err = jpeg.Encode(largeFile, imageLarge, &jpeg.Options{90})
		if err != nil {
			log.Println("process image error 4:", err)
		}

		/*
		  ========================================
		  Small Image
		  ========================================
		*/

		// Step 4: Resize image to width = 600 px.
		smallFilePath := "./images/profile/small/"
		imageSmall := imaging.Resize(originalImage, 600, 0, imaging.Linear)

		// Step 5: Save image in directory.
		smallFile, err := os.Create(smallFilePath + fileName)
		defer smallFile.Close()
		if err != nil {
			log.Println("process image error 5:", err)
		}

		// Step 6: Compress image.
		err = jpeg.Encode(smallFile, imageSmall, &jpeg.Options{90})
		if err != nil {
			log.Println("process image error 6:", err)
		}

		/*
		  ========================================
		  Update Database
		  ========================================
		*/

		// Step 7: Get image file name from database.
		resume := new(Resume)
		selector := bson.M{"profile.background": 1}
		err = getFileName(resumeID, userID, &selector, resume)
		if err != nil {
			log.Println("process image error 7:", err)
		}

		// Step 8: Save image file name in database.
		change := bson.M{"profile.background": fileName}
		err = updateBackground(resumeID, userID, &change)
		if err != nil {
			log.Println("process image error 8:", err)
		}

		// Step 9: Delete old large image from directory.
		err = os.Remove(largeFilePath + resume.Profile.Background)
		if err != nil {
			log.Println("process image error 9:", err)
		}

		// Step 10: Delete old small image from directory.
		err = os.Remove(smallFilePath + resume.Profile.Background)
		if err != nil {
			log.Println("process image error 10:", err)
		}
	case 2: // experience
	case 3: // skills
	case 4: // achievements
	case 5: // contact
	default:
		log.Println("Process upload file category not matched.")
	}

	return fileName, err
}

/*
  ========================================
  Portfolio
  ========================================
*/

func loadPortfolioJSON(w http.ResponseWriter, r *http.Request) {

	// **** EDIT ****
	returnCode := 0

	if uID, err := readSession("userID", w, r); err == nil && uID != nil {
		portfolio := new(Portfolio)
		portfolioID := vestigo.Param(r, "portfolioID")
		userID := uID.(string)

		if portfolioID != "-1" { // existing portfolio
			selector := bson.M{"portfolioid": portfolioID, "userid": userID}

			if err = loadPortfolioDB(portfolio, &selector); err != nil {
				returnCode = 1
			}
		} else { // new portfolio
			portfolio.PortfolioID = "-1"
			portfolio.Title = "Untitled Portfolio"
		}

		if returnCode == 0 {
			if err = json.NewEncoder(w).Encode(portfolio); err != nil {
				returnCode = 2
			}
		}

		// error handling
		if returnCode != 0 {
			handleError(returnCode, errorStatusCode, "Portfolio could not be loaded at this time.", w)
		}
	} else {
		handleError(3, 403, "Session expired. Please sign in again.", w)
	}
}

func insertPortfolioJSON(w http.ResponseWriter, r *http.Request) {
	returnCode := 0

	if uID, err := readSession("userID", w, r); err == nil && uID != nil {
		categoryInt := 0
		portfolio := new(Portfolio)
		portfolio.UserID = uID.(string)
		user := new(User)
		user.UserID = uID.(string)

		categoryStr := vestigo.Param(r, "category")
		/*
		   1 = settings
		   2 = profileType
		   3 = experienceType
		*/

		if categoryInt, err = strconv.Atoi(categoryStr); err != nil {
			returnCode = 1
		}

		if returnCode == 0 {
			if portfolio.PortfolioID, err = insertPortfolioDB(portfolio.UserID); err != nil { // Step 1
				returnCode = 2
			}
		}

		if returnCode == 0 {
			if err = insertUPortfolio(portfolio.UserID, portfolio.PortfolioID); err != nil { // Step 2
				returnCode = 3
			}
		}

		if returnCode == 0 {
			if err = updatePortfolio(categoryInt, portfolio, r); err != nil { // Step 3
				returnCode = 4
			}
		}

		if returnCode == 0 {
			if err = json.NewEncoder(w).Encode(portfolio); err != nil {
				returnCode = 7
			}
		}

		// error handling
		if returnCode != 0 {
			handleError(returnCode, errorStatusCode, "Portfolio could not be inserted at this time.", w)
		}
	} else {
		handleError(3, 403, "Session expired. Please sign in again.", w)
	}
}

func updatePortfolioJSON(w http.ResponseWriter, r *http.Request) {
	returnCode := 0

	if uID, err := readSession("userID", w, r); err == nil && uID != nil {
		categoryInt := 0
		portfolio := new(Portfolio)
		portfolio.UserID = uID.(string)

		categoryStr := vestigo.Param(r, "category")
		/*
					   1 = settings
					   2 = header
			           3 = content
		*/

		if categoryInt, err = strconv.Atoi(categoryStr); err != nil {
			returnCode = 1
		}

		if returnCode == 0 {
			portfolio.PortfolioID = vestigo.Param(r, "portfolioID")

			if err = updatePortfolio(categoryInt, portfolio, r); err != nil {
				returnCode = 2
			}
		}

		if returnCode == 0 {
			if err = json.NewEncoder(w).Encode(portfolio); err != nil {
				returnCode = 3
			}
		}

		// error handling
		if returnCode != 0 {
			handleError(returnCode, errorStatusCode, "Portfolio could not be updated at this time.", w)
		}
	} else {
		handleError(3, 403, "Session expired. Please sign in again.", w)
	}
}

func updatePortfolio(categoryInt int, portfolio *Portfolio, r *http.Request) error {
	var err error

	switch categoryInt {
	case 1:
		// part 1: update portfolio settings

		if err := json.NewDecoder(r.Body).Decode(portfolio); err != nil {
			log.Println("update portfolio error 1.1:", err)
		}

		portfolio.TitleURL = getTitleURL(portfolio.Title)
		portfolio.LinkURL = getLinkURL(portfolio.Title)

		if err := updatePSettings(portfolio.PortfolioID, portfolio.UserID, portfolio); err != nil {
			log.Println("update portfolio error 1.2:", err)
		}

		// part 2: update user portfolio

		basicPortfolio := new(BasicPortfolio)

		basicPortfolio.PortfolioID = portfolio.PortfolioID
		basicPortfolio.Title = portfolio.Title

		if err := updateUPortfolio(portfolio.UserID, basicPortfolio); err != nil {
			log.Println("update portfolio error 1.3:", err)
		}
	case 2:
		if err := json.NewDecoder(r.Body).Decode(portfolio); err != nil {
			log.Println("update portfolio error 2.1:", err)
		}

		// portfolio.Background = new(Image)

		if err := updatePHeader(portfolio); err != nil {
			log.Println("update portfolio error 2.2:", err)
		}
	case 3:
		var content string

		if err := json.NewDecoder(r.Body).Decode(&content); err != nil {
			log.Println("update portfolio error 3.1:", err)
		}

		if err := updatePContent(portfolio.PortfolioID, portfolio.UserID, content); err != nil {
			log.Println("update portfolio error 3.2:", err)
		}

		portfolio.Content = content
	default:
		log.Println("No category selected. Portfolio not updated.")
	}

	return err
}

func deletePortfolioJSON(w http.ResponseWriter, r *http.Request) {
	returnCode := 0

	if uID, err := readSession("userID", w, r); err == nil && uID != nil {
		userID := uID.(string)
		portfolioID := vestigo.Param(r, "portfolioID")

		if err := deleteUPortfolio(userID, portfolioID); err != nil { // part 1: delete user portfolio info
			returnCode = 1
		}

		if returnCode == 0 {
			if err := deletePortfolioDB(portfolioID, userID); err != nil { // part 2: delete portfolio
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
			handleError(returnCode, errorStatusCode, "Portfolio could not be deleted at this time.", w)
		}
	} else {
		handleError(3, 403, "Session expired. Please sign in again.", w)
	}
}

/*
  ========================================
  User
  ========================================
*/

func insertUserJSON(w http.ResponseWriter, r *http.Request) {
	// **** EDIT ****

	userID, err := insertUserDB()
	if err != nil {
		log.Println("insert user json error 1:", err)
	}

	if err := json.NewEncoder(w).Encode(userID); err != nil {
		log.Println("insert user json error 2:", err)
	}
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
  Error Handling
  ========================================
*/

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

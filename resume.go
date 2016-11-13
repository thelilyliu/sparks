package main

import (
	// "log"
	"time"

	"gopkg.in/mgo.v2/bson"
)

type Resume struct {
	ResumeID     string           `json:"resumeID"`
	UserID       string           `json:"userID"`
	Date         string           `json:"date"`
	Title        string           `json:"title"`
	TitleURL     string           `json:"titleURL"`
	LinkURL      string           `json:"linkURL"`
	ThemeID      string           `json:"themeID"`
	ThemeName    string           `json:"themeName"`
	Profile      ProfileType      `json:"profile"`
	Experience   ExperienceType   `json:"experience"`
	Skills       SkillsType       `json:"skills"`
	Portfolio    PortfolioType    `json:"portfolio"`
	Achievements AchievementsType `json:"achievements"`
	Contact      ContactType      `json:"contact"`
}

type ProfileType struct {
	Headline   string `json:"headline"`
	Subtitle   string `json:"subtitle"`
	Summary    string `json:"summary"`
	Background string `json:"background"`
}

type ExperienceType struct {
	Experiences []Experience `json:"experiences"`
	Background  Image        `json:"background"`
}

type SkillsType struct {
	Skills     []Skill `json:"skills"`
	Background Image   `json:"background"`
}

type PortfolioType struct {
	Portfolios []Portfolio `json:"portfolios"`
	Background Image       `json:"image"`
}

type AchievementsType struct {
	Educations     []Education     `json:"educations"`
	Qualifications []Qualification `json:"qualifications"`
	Awards         []Award         `json:"awards"`
	Background     Image           `json:"background"`
}

type ContactType struct {
	FirstName   string `json:"firstName"`
	LastName    string `json:"lastName"`
	Biography   string `json:"biography"`
	HomePhone   string `json:"homePhone"`
	MobilePhone string `json:"mobilePhone"`
	WorkPhone   string `json:"workPhone"`
	Extension   string `json:"extension"`
	Location    string `json:"location"`
	Email       string `json:"email"`
	Website     string `json:"website"`
	Facebook    string `json:"facebook"`
	Twitter     string `json:"twitter"`
	LinkedIn    string `json:"linkedIn"`
	ProfilePic  Image  `json:"profilePic"`
	Background  Image  `json:"background"`
}

type Experience struct {
	JobTitle         string `json:"jobTitle"`
	Company          string `json:"company"`
	Duration         string `json:"duration"`
	Responsibilities string `json:"responsibilities"`
	Order            int    `json:"order"`
}

type Skill struct {
	Name  string `json:"name"`
	Level int    `json:"level"`
	Order int    `json:"order"`
}

type Education struct {
	School     string `json:"school"`
	StartMonth string `json:"startMonth"`
	StartYear  string `json:"startYear"`
	EndMonth   string `json:"endMonth"`
	EndYear    string `json:"endYear"`
	Major      string `json:"major"`
	Minor      string `json:"minor"`
	Specialist string `json:"specialist"`
	Notes      string `json:"notes"`
	Order      int    `json:"order"`
}

type Qualification struct {
	Name  string `json:"name"`
	Date  string `json:"date"`
	Notes string `json:"notes"`
	Order int    `json:"order"`
}

type Award struct {
	Name  string `json:"name"`
	Date  string `json:"date"`
	Notes string `json:"notes"`
	Order int    `json:"order"`
}

/*
  ========================================
  Load
  ========================================
*/

func loadResumeDB(resume *Resume, selector *bson.M) error {
	// create new MongoDB session
	collection, session := mongoDBInitialization("resume")
	defer session.Close()

	// retrieve one document with resumeID as selector
	return collection.Find(selector).One(resume)
}

/*
  ========================================
  Insert
  ========================================
*/

func insertResumeDB(userID string) (string, error) {
	// create new MongoDB session
	collection, session := mongoDBInitialization("resume")
	defer session.Close()

	resume := new(Resume)

	// initialize fields
	resume.ResumeID = bson.NewObjectId().String()                  // get new ObjectId string
	resume.ResumeID = resume.ResumeID[13 : len(resume.ResumeID)-2] // remove extra characters
	resume.UserID = userID
	resume.Date = time.Now().Format("20060102150405")
	resume.Title = "Untitled Resume"

	// insert resume
	err := collection.Insert(resume)

	return resume.ResumeID, err
}

/*
  ========================================
  Update
  ========================================
*/

func updateResumeDB(selector, update *bson.M) error {
	// create new MongoDB session
	collection, session := mongoDBInitialization("resume")
	defer session.Close()

	return collection.Update(selector, update)
}

func updateAllResumeDB(selector, update *bson.M) error {
	// create new MongoDB session
	collection, session := mongoDBInitialization("resume")
	defer session.Close()

	_, err := collection.UpdateAll(selector, update)

	return err
}

func updateRSettings(resumeID, userID string, resume *Resume) error {
	change := bson.M{"title": resume.Title, "titleurl": resume.TitleURL, "linkurl": resume.LinkURL}

	// find document and update fields
	selector := bson.M{"resumeid": resumeID, "userid": userID}
	update := bson.M{"$set": &change}

	return updateResumeDB(&selector, &update)
}

func updateRProfileType(resumeID, userID string, profile *ProfileType) error {
	change := bson.M{"profile": profile}

	// find document and update fields
	selector := bson.M{"resumeid": resumeID, "userid": userID}
	update := bson.M{"$set": &change}

	return updateResumeDB(&selector, &update)
}

func updateRExperienceType(resumeID, userID string, experience *ExperienceType) error {
	change := bson.M{"experience": experience}

	// find document and update fields
	selector := bson.M{"resumeid": resumeID, "userid": userID}
	update := bson.M{"$set": &change}

	return updateResumeDB(&selector, &update)
}

func updateRSkillsType(resumeID, userID string, skills *SkillsType) error {
	change := bson.M{"skills": skills}

	// find document and update fields
	selector := bson.M{"resumeid": resumeID, "userid": userID}
	update := bson.M{"$set": &change}

	return updateResumeDB(&selector, &update)
}

func updateRPortfolioType() {

	// **** EDIT ****

}

func updateRAchievementsType() {

	// **** EDIT ****

}

func updateRContactType(resumeID, userID string, contact *ContactType) error {
	change := bson.M{"contact": contact}

	// find document and update fields
	selector := bson.M{"resumeid": resumeID, "userid": userID}
	update := bson.M{"$set": &change}

	return updateResumeDB(&selector, &update)
}

func updateRContactTypeName(userID, firstName, lastName string) error {
	change := bson.M{"contact.firstname": firstName, "contact.lastname": lastName}

	// find document and update fields
	selector := bson.M{"userid": userID}
	update := bson.M{"$set": &change}

	return updateAllResumeDB(&selector, &update)
}

func updateRExperiences(resumeID, userID string, experiences *[]Experience) error {
	change := bson.M{"experience.experiences": experiences}

	// find document and update fields
	selector := bson.M{"resumeid": resumeID, "userid": userID}
	update := bson.M{"$set": &change}

	return updateResumeDB(&selector, &update)
}

func updateRSkills(resumeID, userID string, skills *[]Skill) error {
	change := bson.M{"skills.skills": skills}

	// find document and update fields
	selector := bson.M{"resumeid": resumeID, "userid": userID}
	update := bson.M{"$set": &change}

	return updateResumeDB(&selector, &update)
}

func updateRPortfolios() {

	// **** EDIT ****

}

func updateREducations(resumeID, userID string, educations *[]Education) error {
	change := bson.M{"achievements.educations": educations}

	// find document and update fields
	selector := bson.M{"resumeid": resumeID, "userid": userID}
	update := bson.M{"$set": &change}

	return updateResumeDB(&selector, &update)
}

func updateRQualifications(resumeID, userID string, qualifications *[]Qualification) error {
	change := bson.M{"achievements.qualifications": qualifications}

	// find document and update fields
	selector := bson.M{"resumeid": resumeID, "userid": userID}
	update := bson.M{"$set": &change}

	return updateResumeDB(&selector, &update)
}

func updateRAwards(resumeID, userID string, awards *[]Award) error {
	change := bson.M{"achievements.awards": awards}

	// find document and update fields
	selector := bson.M{"resumeid": resumeID, "userid": userID}
	update := bson.M{"$set": &change}

	return updateResumeDB(&selector, &update)
}

func updateBackground(resumeID string, change *bson.M) error {
	// find document and update fields
	selector := bson.M{"resumeid": resumeID}
	update := bson.M{"$set": &change}

	return updateResumeDB(&selector, &update)
}

/*
func updateBackground(resumeID, userID string, change *bson.M) error {
	// find document and update fields
	selector := bson.M{"resumeid": resumeID, "userid": userID}
	update := bson.M{"$set": &change}

	return updateResumeDB(&selector, &update)
}
*/

/*
  ========================================
  Delete
  ========================================
*/

func deleteResumeDB(resumeID, userID string) error {
	// create new MongoDB session
	collection, session := mongoDBInitialization("resume")
	defer session.Close()

	// find document and delete resume
	selector := bson.M{"resumeid": resumeID, "userid": userID}

	return collection.Remove(selector)
}

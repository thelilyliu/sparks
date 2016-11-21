package main

import (
	"net/http"

	"github.com/gorilla/sessions"
	"gopkg.in/mgo.v2/bson"
)

var store = sessions.NewCookieStore([]byte("something-very-secret"))

/*
  ========================================
  Session
  ========================================
*/

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
  Check
  ========================================
*/

func checkPasswordDB(inputEmail, inputPassword string) (string, error) {
	user := new(User)

	// create new MongoDB session
	collection, session := mongoDBInitialization("user")
	defer session.Close()

	// retrieve password field with email as selector
	selector := bson.M{"email": inputEmail}
	err := collection.Find(selector).Select(bson.M{"password": 1, "userid": 1}).One(user)

	if inputPassword != user.Password { // incorrect password
		user.UserID = "-1"
	}

	return user.UserID, err
}

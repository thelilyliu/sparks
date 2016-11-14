package main

import (
	"gopkg.in/mgo.v2/bson"
)

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

function loadResumeInit(json, json2, situation) {
    if (situation == 0) { // normal load
        constructResumeHTML();

        if (!jQuery.isEmptyObject(json)) { // JSON is not empty
            initResumeData(json[0]);
            initResumeProfileData(json[0].profile);
            initResumeExperienceData(json[0].experience);
            initResumeContactData(json[0].contact);

            initializeFullPage();
            eventHandlerResume();
            setupAutosaveTimer(situation);
        }
        else { // error
            console.log('Resume: load resume JSON is empty.');
        }
    }
    else { // autosave
        checkResumeProfileTypeChanges(situation);
        checkResumeContactTypeChanges(situation);
        checkResumeExperiencesChanges(situation);
    }
    
    
    function setupAutosaveTimer(situation) {
        var timerID = setInterval(function() {
            checkResumeProfileTypeChanges(situation);
            checkResumeContactTypeChanges(situation);
            checkResumeExperiencesChanges(situation);
        }, 5000);
        $('body').data('autosave-timer', timerID);
    }
    
    function constructResumeHTML() {
        var userResumeHTML = '\
            <div id="fullpage" class="edit">\
                <section id="profile">\
                    <div class="container">\
                        <h1>Profile</h1>\
                        <form class="form-horizontal"></form>\
                    </div>\
                </section>\
                <section id="experience">\
                    <div class="container">\
                        <h1>Experience</h1>\
                        <form class="form-horizontal">\
                            <ul class="sortable default"></ul>\
                        </form>\
                    </div>\
                </section>\
                <section id="skills">\
                    <div class="container">\
                        <h1>Skills</h1>\
                        <form class="form-horizontal"></form>\
                    </div>\
                </section>\
                <section id="contact">\
                    <div class="container">\
                        <h1>Contact</h1>\
                        <form class="form-horizontal"></form>\
                    </div>\
                </section>\
            </div>';

        var userResumeProfileHTML = '\
            <div class="form-group">\
                <label for="inputHeadline" class="col-sm-3 control-label">Headline</label>\
                <div class="col-sm-9">\
                    <input type="headline" class="form-control" id="inputHeadline" placeholder="Headline">\
                </div>\
            </div>\
            \
            <div class="form-group">\
                <label for="inputSubtitle" class="col-sm-3 control-label">Subtitle</label>\
                <div class="col-sm-9">\
                    <input type="subtitle" class="form-control" id="inputSubtitle" placeholder="Subtitle">\
                </div>\
            </div>\
            \
            <div class="form-group">\
                <label for="inputSummary" class="col-sm-3 control-label">Summary</label>\
                <div class="col-sm-9">\
                    <div id="summernote-summary" class="summernote"></div>\
                </div>\
            </div>\
            \
            <div class="form-group">\
                <label for="inputProfileBackground" class="col-sm-3 control-label">Background</label>\
                <div class="col-sm-9">\
                    <label class="file">\
                        <input type="file" id="inputProfileBackground">\
                        <span class="file-custom"></span>\
                    </label>\
                </div>\
            </div>';
        
        var userResumeContactHTML = '\
            <span id="inputFirstName" class="hidden"></span>\
            <span id="inputLastName" class="hidden"></span>\
            <div class="form-group">\
                <label for="inputBiography" class="col-sm-3 control-label">Biography</label>\
                <div class="col-sm-9">\
                    <div id="summernote-biography" class="summernote"></div>\
                </div>\
            </div>\
            <div class="form-group">\
                <label for="inputHomePhone" class="col-sm-3 control-label">Home Phone</label>\
                <div class="col-sm-9">\
                    <input type="home-phone" class="form-control" id="inputHomePhone" placeholder="Home Phone">\
                </div>\
            </div>\
            \
            <div class="form-group">\
                <label for="inputMobilePhone" class="col-sm-3 control-label">Mobile Phone</label>\
                <div class="col-sm-9">\
                    <input type="mobile-phone" class="form-control" id="inputMobilePhone" placeholder="Mobile Phone">\
                </div>\
            </div>\
            \
            <div class="form-group">\
                <label for="inputWorkPhone" class="col-sm-3 control-label">Work Phone</label>\
                <div class="col-sm-9">\
                    <input type="work-phone" class="form-control" id="inputWorkPhone" placeholder="Work Phone">\
                </div>\
            </div>\
            \
            <div class="form-group">\
                <label for="inputLocation" class="col-sm-3 control-label">Location</label>\
                <div class="col-sm-9">\
                    <input type="location" class="form-control" id="inputLocation" placeholder="Location">\
                </div>\
            </div>\
            \
            <div class="form-group">\
                <label for="inputEmail" class="col-sm-3 control-label">Email</label>\
                <div class="col-sm-9">\
                    <input type="email" class="form-control" id="inputEmail" placeholder="Email">\
                </div>\
            </div>\
            \
            <div class="form-group">\
                <label for="inputWebsite" class="col-sm-3 control-label">Website</label>\
                <div class="col-sm-9">\
                    <input type="website" class="form-control" id="inputWebsite" placeholder="Website">\
                </div>\
            </div>\
            \
            <div class="form-group">\
                <label for="inputContactBackground" class="col-sm-3 control-label">Background</label>\
                <div class="col-sm-9">\
                    <label class="file">\
                        <input type="file" id="inputContactBackground">\
                        <span class="file-custom"></span>\
                    </label>\
                </div>\
            </div>';
        
        var experienceButtonHTML = '\
            <button id="new-experience" type="button" class="default new-button">\
                <i class="fa fa-plus absolute-center vertical-align"></i>\
            </button>';
        
        $('body').data('page', 'uResume');
        console.log('page: uResume');
        
        $('#page-content-wrapper').append(userResumeHTML);
        $('#profile .form-horizontal').append(userResumeProfileHTML);
        $('#experience .container').append(experienceButtonHTML);
        $('#contact .form-horizontal').append(userResumeContactHTML);
        
        initSummernote('#summernote-summary');
        initSummernote('#summernote-biography');

        $('#navbar-top-layer-2 .back').attr('link', '/user/resumes');
        $('#navbar-top-layer-2 .preview').attr('link', '/resume/' + globalResumeID);
    }
    
    
    function initResumeData(json) {
        $('#navbar-top-layer-2 .title a').text(json.title)
            .attr('href', '/user/resume/' + globalResumeID + '#section1');
    }
    
    function initResumeProfileData(json) {
        // set resume profile
        $('#inputHeadline').val(json.headline);
        $('#inputSubtitle').val(json.subtitle);
        $('#summernote-summary').summernote('code', json.summary);
        // json.background

        // get resume profile JSON
        var resumeProfile = {
            headline: json.headline,
            subtitle: json.subtitle,
            summary: json.summary
            // background: json.background
        };

        var resumeProfileJSON = JSON.stringify(resumeProfile);
        $('#profile .form-horizontal').data('JSONData', resumeProfileJSON);
    }
    
    function initResumeExperienceData(json) {
        var $this = $('#experience .form-horizontal');
        var experiencesArray = [];
        
        if (json.experiences != null && json.experiences.length > 0) { // not undefined or empty
            // http://stackoverflow.com/questions/979256/sorting-an-array-of-javascript-objects
            json.experiences.sort(function(a, b) {
                return a.order - b.order;
            });
            
            $.each(json.experiences, function(i, experience) {
                var userResumeExperienceHTML = '\
                    <li id="experience-group' + (i + 1) + '" class="experience-group ui-state-default">\
                        <div class="button-group">\
                            <button type="button" class="move up default" aria-label="Up"><i class="fa fa-chevron-up"></i></button>\
                            <button type="button" class="delete default" aria-label="Close"><i class="fa fa-times"></i></button>\
                            <button type="button" class="move down default" aria-label="Down"><i class="fa fa-chevron-down"></i></button>\
                        </div>\
                        <div class="form-group">\
                            <label for="inputJobTitle' + (i + 1) + '" class="col-sm-3 control-label">Job Title</label>\
                            <div class="col-sm-9">\
                                <input type="job-title" class="form-control" id="inputJobTitle' + (i + 1) + '" placeholder="Job Title">\
                            </div>\
                        </div>\
                        \
                        <div class="form-group">\
                            <label for="inputCompany' + (i + 1) + '" class="col-sm-3 control-label">Company</label>\
                            <div class="col-sm-9">\
                                <input type="company" class="form-control" id="inputCompany' + (i + 1) + '" placeholder="Company">\
                            </div>\
                        </div>\
                        \
                        <div class="form-group">\
                            <label for="inputDuration' + (i + 1) + '" class="col-sm-3 control-label">Duration</label>\
                            <div class="col-sm-9">\
                                <input type="duration" class="form-control" id="inputDuration' + (i + 1) + '" placeholder="Duration">\
                            </div>\
                        </div>\
                        <div class="form-group">\
                            <label for="inputResponsibilities' + (i + 1) + '" class="col-sm-3 control-label">Responsibilities</label>\
                            <div class="col-sm-9">\
                                <div id="summernote-responsibilities' + (i + 1) + '" class="summernote"></div>\
                            </div>\
                        </div>\
                    </li>';

                $('#experience .form-horizontal ul.sortable').append(userResumeExperienceHTML);

                initSummernote('#summernote-responsibilities' + (i + 1));

                // set resume experience
                $('#inputJobTitle' + (i + 1)).val(experience.jobTitle);
                $('#inputCompany' + (i + 1)).val(experience.company);
                $('#inputDuration' + (i + 1)).val(experience.duration);
                $('#summernote-responsibilities' + (i + 1)).summernote('code', experience.responsibilities);
                $('#experience-group' + (i + 1)).attr('order', experience.order);

                // get resume experience JSON
                var resumeExperience = {
                    jobTitle: experience.jobTitle,
                    company: experience.company,
                    duration: experience.duration,
                    responsibilities: experience.responsibilities,
                    order: experience.order
                };

                experiencesArray.push(resumeExperience);
            });

            $this.find('.experience-group').first().addClass('first');
            $this.find('.experience-group').last().addClass('last');
        }
        else {
            addExperienceGroup();

            // get resume experience JSON
            var resumeExperience = {
                jobTitle: '',
                company: '',
                duration: '',
                responsibilities: '<ul><li><br></li></ul>',
                order: 0
            };

            experiencesArray.push(resumeExperience);
        }
        
        var resumeExperienceJSON = JSON.stringify(experiencesArray);
        $this.data('JSONData', resumeExperienceJSON);
    }

    /*
    function initResumeSkillsData(json) {
        var $this = $('#skills .form-horizontal');
        var skillsArray = [];
        
        if (json.experiences != null && json.experiences.length > 0) { // not undefined or empty
            // http://stackoverflow.com/questions/979256/sorting-an-array-of-javascript-objects
            json.experiences.sort(function(a, b) {
                return a.order - b.order;
            });
            
            $.each(json.experiences, function(i, experience) {
                var userResumeExperienceHTML = '\
                    <div id="experience-group' + (i + 1) + '" class="experience-group">\
                        <div class="button-group">\
                            <button type="button" class="move up default" aria-label="Up"><i class="fa fa-chevron-up"></i></button>\
                            <button type="button" class="delete default" aria-label="Close"><i class="fa fa-times"></i></button>\
                            <button type="button" class="move down default" aria-label="Down"><i class="fa fa-chevron-down"></i></button>\
                        </div>\
                        <div class="form-group">\
                            <label for="inputJobTitle' + (i + 1) + '" class="col-sm-3 control-label">Job Title</label>\
                            <div class="col-sm-9">\
                                <input type="job-title" class="form-control" id="inputJobTitle' + (i + 1) + '" placeholder="Job Title">\
                            </div>\
                        </div>\
                        \
                        <div class="form-group">\
                            <label for="inputCompany' + (i + 1) + '" class="col-sm-3 control-label">Company</label>\
                            <div class="col-sm-9">\
                                <input type="company" class="form-control" id="inputCompany' + (i + 1) + '" placeholder="Company">\
                            </div>\
                        </div>\
                        \
                        <div class="form-group">\
                            <label for="inputDuration' + (i + 1) + '" class="col-sm-3 control-label">Duration</label>\
                            <div class="col-sm-9">\
                                <input type="duration" class="form-control" id="inputDuration' + (i + 1) + '" placeholder="Duration">\
                            </div>\
                        </div>\
                        <div class="form-group">\
                            <label for="inputResponsibilities' + (i + 1) + '" class="col-sm-3 control-label">Responsibilities</label>\
                            <div class="col-sm-9">\
                                <div id="summernote-responsibilities' + (i + 1) + '" class="summernote"></div>\
                            </div>\
                        </div>\
                    </div>';

                $this.append(userResumeExperienceHTML);

                initSummernote('#summernote-responsibilities' + (i + 1));

                // set resume experience
                $('#inputJobTitle' + (i + 1)).val(experience.jobTitle);
                $('#inputCompany' + (i + 1)).val(experience.company);
                $('#inputDuration' + (i + 1)).val(experience.duration);
                $('#summernote-responsibilities' + (i + 1)).summernote('code', experience.responsibilities);
                $('#experience-group' + (i + 1)).attr('order', experience.order);

                // get resume experience JSON
                var resumeExperience = {
                    jobTitle: experience.jobTitle,
                    company: experience.company,
                    duration: experience.duration,
                    responsibilities: experience.responsibilities,
                    order: experience.order
                };

                experiencesArray.push(resumeExperience);
            });
        }
        else {
            addExperienceGroup();

            // get resume experience JSON
            var resumeExperience = {
                jobTitle: '',
                company: '',
                duration: '',
                responsibilities: '<ul><li><br></li></ul>',
                order: 0
            };

            experiencesArray.push(resumeExperience);
        }
        
        var resumeExperienceJSON = JSON.stringify(experiencesArray);
        $this.data('JSONData', resumeExperienceJSON);
    }
    */

    function initResumeContactData(json) {
        var $this = $('#contact .form-horizontal');

        // set resume contact
        $this.find('#inputFirstName').text(json.firstName);
        $this.find('#inputLastName').text(json.lastName);
        $this.find('#summernote-biography').summernote('code', json.biography);
        $this.find('#inputHomePhone').val(json.homePhone);
        $this.find('#inputMobilePhone').val(json.mobilePhone);
        $this.find('#inputWorkPhone').val(json.workPhone);
        // $this.find('#inputExtension').val(json.extension);
        $this.find('#inputLocation').val(json.location);
        $this.find('#inputEmail').val(json.email);
        $this.find('#inputWebsite').val(json.website);
        // json.facebook
        // json.twitter
        // json.linkedIn
        // json.profilePic
        // json.background

        // get resume contact JSON
        var resumeContact = {
            firstName: json.firstName,
            lastName: json.lastName,
            biography: json.biography,
            homePhone: json.homePhone,
            mobilePhone: json.mobilePhone,
            workPhone: json.workPhone,
            // extension: json.extension,
            location: json.location,
            email: json.email,
            website: json.website
            // facebook: json.facebook,
            // twitter: json.twitter,
            // linkedIn: json.linkedIn,
            // profilePic: json.profilePic,
            // background: json.background
        };

        var resumeContactJSON = JSON.stringify(resumeContact);
        $this.data('JSONData', resumeContactJSON);
    }
    
    
    function addExperienceGroup() {
        var i = $('.experience-group').length;
        
        var userResumeExperienceHTML = '\
            <div id="experience-group' + (i + 1) + '" class="experience-group">\
                <div class="button-group">\
                    <button type="button" class="move up default" aria-label="Up"><i class="fa fa-chevron-up"></i></button>\
                    <button type="button" class="delete default" aria-label="Close"><i class="fa fa-times"></i></button>\
                    <button type="button" class="move down default" aria-label="Down"><i class="fa fa-chevron-down"></i></button>\
                </div>\
                <div class="form-group">\
                    <label for="inputJobTitle' + (i + 1) + '" class="col-sm-3 control-label">Job Title</label>\
                    <div class="col-sm-9">\
                        <input type="job-title" class="form-control" id="inputJobTitle' + (i + 1) + '" placeholder="Job Title">\
                    </div>\
                </div>\
                \
                <div class="form-group">\
                    <label for="inputCompany' + (i + 1) + '" class="col-sm-3 control-label">Company</label>\
                    <div class="col-sm-9">\
                        <input type="company" class="form-control" id="inputCompany' + (i + 1) + '" placeholder="Company">\
                    </div>\
                </div>\
                \
                <div class="form-group">\
                    <label for="inputDuration' + (i + 1) + '" class="col-sm-3 control-label">Duration</label>\
                    <div class="col-sm-9">\
                        <input type="duration" class="form-control" id="inputDuration' + (i + 1) + '" placeholder="Duration">\
                    </div>\
                </div>\
                <div class="form-group">\
                    <label for="inputResponsibilities' + (i + 1) + '" class="col-sm-3 control-label">Responsibilities</label>\
                    <div class="col-sm-9">\
                        <div id="summernote-responsibilities' + (i + 1) + '" class="summernote"></div>\
                    </div>\
                </div>\
            </div>';

        $('#experience .form-horizontal').append(userResumeExperienceHTML);
        $('.experience-group').last().attr('order', i);
        
        initSummernote('#summernote-responsibilities' + (i + 1));
        $('#summernote-responsibilities' + (i + 1)).summernote('code', '<ul><li><br></li></ul>');
    }
    

    function eventHandlerResume() {
        $('#navbar-top-layer-2').on('click', '.back', function() {
            page($(this).attr('link'));
        });
        
        $('#navbar-top-layer-2').on('click', '.preview', function() {
            window.open($(this).attr('link'), '_blank');
        });
        
        $('#experience').on('click', '#new-experience', function() {
            $('.experience-group').last().removeClass('last');

            addExperienceGroup();
            $.fn.fullpage.reBuild();
            $('.experience-group').last().addClass('last');
        });
        
        $('#experience').on('click', 'button.delete', function(e) {
            e.stopPropagation();

            var $this = $(this).closest('.experience-group');
            $this.fadeOut(500, function() {
                $this.remove();
                $.fn.fullpage.reBuild();
                $('.experience-group').last().addClass('last');
            });
        });
        
        $('.sortable').sortable(); // **** In the voice of Alexander Hamilton: "So it needs amendment." ****

        $('#experience').on('click', 'button.move', function() {
            var $item = $(this).closest('.experience-group');
            var order = $item.attr('order');
            
            if ($(this).hasClass('up')) {
                $item.attr('order', (order - 1));
                $item.prev().attr('order', order);
                
                $item.swapWith($item.prev());
            }
            else {
                $item.attr('order', (order + 1));
                $item.next().attr('order', order);
                
                $item.swapWith($item.next());
            }
        });
        
        // http://summernote.org/deep-dive/#onchange
        $('#experience').on('summernote.change', function() {
            $.fn.fullpage.reBuild();
        });
    }


    function checkResumeProfileTypeChanges(situation) {
        var data = {
            headline: $('#inputHeadline').val(),
            subtitle: $('#inputSubtitle').val(),
            summary: $('#summernote-summary').summernote('code')
            // background
        };

        var newJSONData = JSON.stringify(data);
        var oldJSONData = $('#profile .form-horizontal').data('JSONData');

        updateResume(2, newJSONData, oldJSONData, situation);
    }

    function checkResumeContactTypeChanges(situation) {
        var data = {
            firstName: $('#inputFirstName').text(),
            lastName: $('#inputLastName').text(),
            biography: $('#summernote-biography').summernote('code'),
            homePhone: $('#inputHomePhone').val(),
            mobilePhone: $('#inputMobilePhone').val(),
            workPhone: $('#inputWorkPhone').val(),
            // extension
            location: $('#inputLocation').val(),
            email: $('#inputEmail').val(),
            website: $('#inputWebsite').val()
            // facebook
            // twitter
            // linkedIn
            // profilePic
            // background
        };

        var newJSONData = JSON.stringify(data);
        var oldJSONData = $('#contact .form-horizontal').data('JSONData');

        updateResume(7, newJSONData, oldJSONData, situation);
    }

    function checkResumeExperiencesChanges(situation) {
        var $this = $('#experience .experience-group');
        var experiencesArray = [];
        
        $.each($this, function(i, experience) {
            var data = {
                jobTitle: $('#inputJobTitle' + (i + 1)).val(),
                company: $('#inputCompany' + (i + 1)).val(),
                duration: $('#inputDuration' + (i + 1)).val(),
                responsibilities: $('#summernote-responsibilities' + (i + 1)).summernote('code'),
                order: parseInt($('#experience-group' + (i + 1)).attr('order'))
            };
            
            experiencesArray.push(data);
        });

        var newJSONData = JSON.stringify(experiencesArray);
        var oldJSONData = $('#experience .form-horizontal').data('JSONData');

        updateResume(8, newJSONData, oldJSONData, situation);
    }


    function updateResume(category, newJSONData, oldJSONData, situation) {
        if (newJSONData != oldJSONData) {
            console.log('Before: ' + oldJSONData);
            console.log('After: ' + newJSONData);

            if (globalResumeID != '-1') { // existing post
                updateResumeJSON(category, newJSONData, situation);
            }
            else if (!$('body').hasClass('processing')) { // new post
                $('body').addClass('processing');
                insertResumeJSON(category, newJSONData);
            }
        }
    }
            
    function insertResumeJSON(category, JSONData) {
        $.ajax({
            type: 'POST',
            url: '/insertResumeJSON/' + category,
            data: JSONData,
            contentType: 'application/json; charset=utf-8',
            dataType: 'json',
            cache: false
        }).done(function(json, textStatus, jqXHr) {
            setResumeData(category, json);
            globalResumeID = json.resumeID;
            
            // https://developer.mozilla.org/en-US/docs/Web/API/History_API#The_pushState()_method
            history.replaceState({}, document.title, '/user/resume/' + globalResumeID);
            $('#navbar-top-layer-2 .preview').attr('link', '/resume/' + globalResumeID);
        }).fail(function(jqXHr, textStatus, errorThrown) {
            handleAjaxError(jqXHr, textStatus);
        }).always(function(json) {
            $('body').removeClass('processing');
        });
    }

    function updateResumeJSON(category, JSONData, situation) {
        $.ajax({
            type: 'POST',
            url: '/updateResumeJSON/' + category + '/' + globalResumeID,
            data: JSONData,
            contentType: 'application/json; charset=utf-8',
            dataType: 'json',
            cache: false
        }).done(function(json, textStatus, jqXHr) {
            if (situation == 0) { // normal update
                setResumeData(category, json);
            }
        }).fail(function(jqXHr, textStatus, errorThrown) {
            handleAjaxError(jqXHr, textStatus);
        }).always(function() {});
    }
    
    
    function setResumeData(category, json) {
        switch (category) {
            case 1: // settings
                break;
            case 2: // profileType
                var data = {
                    headline: json.profile.headline,
                    subtitle: json.profile.subtitle,
                    summary: json.profile.summary
                    // background: json.profile.background
                };

                var JSONData = JSON.stringify(data);
                $('#profile .form-horizontal').data('JSONData', JSONData);

                break;
            case 3: // experienceType
                break;
            case 4: // skillsType
                break;
            case 5: // portfoliosType
                break;
            case 6: // otherInfoType
                break;
            case 7: // contactType
                var data = {
                    firstName: json.contact.firstName,
                    lastName: json.contact.lastName,
                    biography: json.contact.biography,
                    homePhone: json.contact.homePhone,
                    mobilePhone: json.contact.mobilePhone,
                    workPhone: json.contact.workPhone,
                    // extension: json.contact.extension,
                    location: json.contact.location,
                    email: json.contact.email,
                    website: json.contact.website
                    // facebook: json.contact.facebook,
                    // twitter: json.contact.twitter,
                    // linkedIn: json.contact.linkedIn,
                    // profilePic: json.contact.profilePic,
                    // background: json.contact.background
                };

                var JSONData = JSON.stringify(data);
                $('#contact .form-horizontal').data('JSONData', JSONData);

                break;
            case 8: // experiences
                var experiencesArray = [];
                
                $.each(json.experience.experiences, function(i, experience) {
                    var data = {
                        jobTitle: experience.jobTitle,
                        company: experience.company,
                        duration: experience.duration,
                        responsibilities: experience.responsibilities,
                        order: experience.order
                    };

                    experiencesArray.push(data);
                });

                var JSONData = JSON.stringify(experiencesArray);
                $('#experience .form-horizontal').data('JSONData', JSONData);
                
                break;
            case 9: // skills
                var skillsArray = [];
                
                $.each(json.skills.skills, function(i, skill) {
                    var data = {
                        name: skill.name,
                        years: skill.years,
                        level: skill.level,
                        order: skill.order
                    };

                    skills.push(data);
                });

                var JSONData = JSON.stringify(experiencesArray);
                $('#skills .form-horizontal').data('JSONData', JSONData);
                
                break;
            default:
                console.log('Error: updateResumeJSON category not matched.');
        }
    }
}
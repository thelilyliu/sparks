function viewResumeInit() {
    $.ajax({
        type: 'GET',
        url: '/viewResumeJSON/' + globalResumeID,
        dataType: 'json',
        timeout: ajaxDynamicTimeout,
        cache: false
    }).done(function(json, textStatus, jqXHr) {
        if (!jQuery.isEmptyObject(json)) { // JSON is not empty
            initMasonry();

            initResumeProfileData(json.profile);
            initResumeExperienceData(json.experience);
            initResumeSkillsData(json.skills);
            initResumeAchievementsData(json.achievements);
            initResumeContactData(json.contact);

            initializeFullPage();
            eventHandlerResume();
        }
        else { // error
            console.log('Resume: load resume JSON is empty.');
        }
    }).fail(function(jqXHr, textStatus, errorThrown) {
        handleAjaxError(jqXHr, textStatus);
    }).always(function() {});
    
    function initResumeProfileData(json) {
        var resumeProfileHTML = '\
            <h1 class="title">' + json.headline + '</h1>\
            <h3 class="subtitle">' + json.subtitle + '</h3>\
            <div class="content">' + json.summary + '</div>';
        
        $('#profile .jumbo').append(resumeProfileHTML);
    }
    
    function initResumeExperienceData(json) {
        // http://stackoverflow.com/questions/979256/sorting-an-array-of-javascript-objects
        json.experiences.sort(function(a, b) {
            return a.order - b.order;
        });
        
        $.each(json.experiences, function(i, experience) {
            var resumeExperienceHTML = '\
                <div class="grid-item card-wrapper">\
                    <div class="card">\
                        <div class="card-header">\
                            <h2 class="title">' + experience.jobTitle + '</h2>\
                            <h3 class="subtitle">' + experience.company + '</h3>\
                            <h4 class="date">' + experience.duration + '</h4>\
                        </div>\
                        <div class="card-content">' + experience.responsibilities + '</div>\
                    </div>\
                </div>';

            setTimeout(function() {
                var $element = $(resumeExperienceHTML);
                $('.grid').append($element) // append items to grid
                    .masonry('appended', $element); // add and lay out newly appended items
            }, 100);
        });
    }

    function initResumeSkillsData(json) {
        // http://stackoverflow.com/questions/979256/sorting-an-array-of-javascript-objects
        json.skills.sort(function(a, b) {
            return a.order - b.order;
        });
        
        var $this = $('#skills .container .row');
        var starHTML = '<i class="fa fa-star"></i>';
        var starOHTML = '<i class="fa fa-star-o"></i>';

        $.each(json.skills, function(i, skill) {
            var resumeSkillHTML = '\
                <div class="card-wrapper col-xs-12 col-sm-6 col-lg-4">\
                    <div class="card card-' + (i % 5) + '">\
                        <div class="card-header">\
                            <h3 class="skill-name">' + skill.name + '</h3>\
                            <div class="skill-level"></div>\
                        </div>\
                    </div>\
                </div>';

            $this.append(resumeSkillHTML);
            var $level = $('#skills .card-wrapper').last().find('.skill-level');

            for (var i = 0; i < skill.level; i++) {
                $level.append(starHTML);
            }
            for (var i = 5; i > skill.level; i--) {
                $level.append(starOHTML);
            }
        });
    }

    function initResumeAchievementsData(json) {
        initResumeEducations(json.educations);
        initResumeQualifications(json.qualifications);
        initResumeAwards(json.awards);
    }

    function initResumeContactData(json) {
        var resumeContactHTML = '\
            <div class="card-wrapper col-xs-12 horizontal-align">\
                <div class="card">\
                    <h3 class="name">' + json.firstName + ' ' + json.lastName + '</h3>\
                    <img class="profile-pic" src="/images/profile-pic/20160908050723.jpg">\
                    <div class="biography">' + json.biography + '</div>\
                    <div class="info">\
                        <div class="home-phone">' + json.homePhone + '</div>\
                        <div class="mobile-phone">' + json.mobilePhone + '</div>\
                        <div class="work-phone">' + json.workPhone + '</div>\
                        <div class="email">' + json.email + '</div>\
                        <div class="location">' + json.location + '</div>\
                        <div class="website"><a href="http://' + json.website + '" target="_blank">' + json.website + '</a></div>\
                    </div>\
                </div>\
            </div>';
            
            /*
            <div class="links">\
                <span class="fa-stack fa-lg facebook">\
                    <i class="fa fa-circle fa-stack-2x"></i>\
                    <i class="fa fa-facebook fa-stack-1x fa-inverse"></i>\
                </span>\
                <span class="fa-stack fa-lg twitter">\
                    <i class="fa fa-circle fa-stack-2x"></i>\
                    <i class="fa fa-twitter fa-stack-1x fa-inverse"></i>\
                </span>\
                <span class="fa-stack fa-lg linkedin">\
                    <i class="fa fa-circle fa-stack-2x"></i>\
                    <i class="fa fa-linkedin fa-stack-1x fa-inverse"></i>\
                </span>\
            </div>\
            */

            /*
            <div class="card-wrapper col-xs-12 col-sm-6 col-lg-4">\
                <a href="https://www.facebook.com/" class="card-link" target="_blank">\
                    <div class="card card-facebook">\
                        <span class="fa fa-facebook fa-2x"></span>\
                        <h3 class="card-info">Facebook</h3>\
                    </div>\
                </a>\
            </div>
            */
        
        $('#contact .container').append(resumeContactHTML);
    }

    function initResumeEducations(json) {
        // http://stackoverflow.com/questions/979256/sorting-an-array-of-javascript-objects
        json.sort(function(a, b) {
            return a.order - b.order;
        });

        var $this = $('#educations');

        $.each(json, function(i, education) {
            var resumeEducationHTML = '\
                <div class="card-wrapper col-xs-12 col-md-6">\
                    <div class="card">\
                        <div class="card-header">\
                            <h3 class="school">' + education.school + '</h3>\
                            <span class="start-date">\
                                <span class="month">' + education.startMonth + '</span>\
                                <span class="year">' + education.startYear + '</span>\
                            </span>\
                            <span>&mdash;</span>\
                            <span class="end-date">\
                                <span class="month">' + education.endMonth + '</span>\
                                <span class="year">' + education.endYear + '</span>\
                            </span>\
                            <div class="major">' + education.major + '</div>\
                            <div class="minor">' + education.minor + '</div>\
                            <div class="specialist">' + education.specialist + '</div>\
                            <div class="notes">' + education.notes + '</div>\
                        </div>\
                    </div>\
                </div>';

            $this.append(resumeEducationHTML);
        });
    }

    function initResumeQualifications(json) {
        // http://stackoverflow.com/questions/979256/sorting-an-array-of-javascript-objects
        json.sort(function(a, b) {
            return a.order - b.order;
        });

        var $this = $('#qualifications');

        $.each(json, function(i, qualification) {
            var resumeQualificationHTML = '\
                <div class="card-wrapper col-xs-12 col-md-6">\
                    <div class="card">\
                        <div class="card-header">\
                            <h3 class="name">' + qualification.name + '</h3>\
                            <div class="date">' + qualification.date + '</div>\
                            <div class="notes">' + qualification.notes + '</div>\
                        </div>\
                    </div>\
                </div>';

            $this.append(resumeQualificationHTML);
        });
    }

    function initResumeAwards(json) {
        // http://stackoverflow.com/questions/979256/sorting-an-array-of-javascript-objects
        json.sort(function(a, b) {
            return a.order - b.order;
        });

        var $this = $('#awards');

        $.each(json, function(i, award) {
            var resumeAwardHTML = '\
                <div class="card-wrapper col-xs-12 col-md-6">\
                    <div class="card">\
                        <div class="card-header">\
                            <h3 class="name">' + award.name + '</h3>\
                            <div class="date">' + award.date + '</div>\
                            <div class="notes">' + award.notes + '</div>\
                        </div>\
                    </div>\
                </div>';

            $this.append(resumeAwardHTML);
        });
    }
    
    function eventHandlerResume() {
        
    }
}
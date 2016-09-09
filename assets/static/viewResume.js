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

    function initResumeContactData(json) {
        var resumeContactHTML = '\
            <div class="card-wrapper col-xs-12 col-sm-6 col-lg-4 horizontal-align">\
                <div class="card">\
                    <h3 class="name">' + json.firstName + ' ' + json.lastName + '</h3>\
                    <img class="profile-pic" src="/images/profile-pic/20160908050723.jpg">\
                    <p class="biography">' + json.biography + '</p>\
                </div>\
            </div>';
            
        var testHTML = '<div class="card-wrapper col-xs-12 col-sm-6 col-lg-4">\
                <a href="tel:647-786-8808" class="card-link">\
                    <div class="card card-phone">\
                        <span class="fa fa-phone fa-2x"></span>\
                        <h3 class="card-info">' + json.homePhone + '</h3>\
                    </div>\
                </a>\
            </div>\
            \
            <div class="card-wrapper col-xs-12 col-sm-6 col-lg-4">\
                <a href="tel:647-786-8808" class="card-link">\
                    <div class="card card-phone">\
                        <span class="fa fa-phone fa-2x"></span>\
                        <h3 class="card-info">' + json.mobilePhone + '</h3>\
                    </div>\
                </a>\
            </div>\
            \
            <div class="card-wrapper col-xs-12 col-sm-6 col-lg-4">\
                <a href="tel:647-786-8808" class="card-link">\
                    <div class="card card-phone">\
                        <span class="fa fa-phone fa-2x"></span>\
                        <h3 class="card-info">' + json.workPhone + '</h3>\
                    </div>\
                </a>\
            </div>\
            \
            <div class="card-wrapper col-xs-12 col-sm-6 col-lg-4">\
                <a href="mailto:lilyxcliu@gmail.com" class="card-link">\
                    <div class="card card-email">\
                        <span class="fa fa-envelope-o fa-2x"></span>\
                        <h3 class="card-info">' + json.email + '</h3>\
                    </div>\
                </a>\
            </div>\
            \
            <!-- <div class="card-wrapper col-xs-12 col-sm-6 col-lg-4">\
                <a href="https://maps.google.com/?q=11 Lavallee Crescent, Brampton ON" class="card-link" target="_blank">\
                    <div class="card card-address">\
                        <!-- <span class="fa fa-location-arrow fa-2x"></span> -->\
                        <!-- <span class="fa fa-map-marker fa-2x"></span>\
                        <h3 class="card-info">' + json.address + '</h3>\
                    </div>\
                </a>\
            </div> -->\
            \
            <div class="card-wrapper col-xs-12 col-sm-6 col-lg-4">\
                <a href="http://dsssmun.com/" class="card-link" target="_blank">\
                    <div class="card card-website">\
                        <!-- <span class="fa fa-laptop fa-2x"></span> -->\
                        <span class="fa fa-desktop fa-2x"></span>\
                        <h3 class="card-info">' + json.website + '</h3>\
                    </div>\
                </a>\
            </div>\
            \
            <div class="card-wrapper col-xs-12 col-sm-6 col-lg-4">\
                <a href="https://www.facebook.com/" class="card-link" target="_blank">\
                    <div class="card card-facebook">\
                        <span class="fa fa-facebook fa-2x"></span>\
                        <h3 class="card-info">Facebook</h3>\
                    </div>\
                </a>\
            </div>\
            \
            <div class="card-wrapper col-xs-12 col-sm-6 col-lg-4">\
                <a href="https://twitter.com/thelilyliu" class="card-link" target="_blank">\
                    <div class="card card-twitter">\
                        <span class="fa fa-twitter fa-2x"></span>\
                        <h3 class="card-info">Twitter</h3>\
                    </div>\
                </a>\
            </div>\
            \
            <div class="card-wrapper col-xs-12 col-sm-6 col-lg-4">\
                <a href="https://www.linkedin.com/uas/login" class="card-link" target="_blank">\
                    <div class="card card-linkedin">\
                        <span class="fa fa-linkedin fa-2x"></span>\
                        <h3 class="card-info">LinkedIn</h3>\
                    </div>\
                </a>\
            </div>';
        
        $('#contact .container').append(resumeContactHTML);
    }
    
    function eventHandlerResume() {
        
    }
}
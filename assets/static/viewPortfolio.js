function viewPortfolioInit() {
    console.log(globalPortfolioID);

    $.ajax({
        type: 'GET',
        url: '/viewPortfolioJSON/' + globalPortfolioID,
        dataType: 'json',
        timeout: ajaxDynamicTimeout,
        cache: false
    }).done(function(json, textStatus, jqXHr) {
        if (!jQuery.isEmptyObject(json)) { // JSON is not empty
            initPortfolioContentData(json.content);

            eventHandlerPortfolio();
        }
        else { // error
            console.log('Resume: load resume JSON is empty.');
        }
    }).fail(function(jqXHr, textStatus, errorThrown) {
        handleAjaxError(jqXHr, textStatus);
    }).always(function() {});
    
    function initPortfolioContentData(json) {
        var portfolioContentHTML = '\
            <div class="content">' + json + '</div>';
        
        $('#main-container .container').append(portfolioContentHTML);
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
    
    function eventHandlerPortfolio() {
        
    }
}
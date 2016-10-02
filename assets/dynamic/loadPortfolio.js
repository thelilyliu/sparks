function loadPortfolioInit(json, json2, situation) {
    if (situation == 0) { // normal load
        constructPortfolioHTML();

        if (!jQuery.isEmptyObject(json)) { // JSON is not empty
            initPortfolioData(json[0]);
            initPortfolioContent(json[0].content);

            initializeFullPagePost();
            eventHandlerPortfolio();
            setupAutosaveTimer(situation);
        }
        else { // error
            console.log('Portfolio: load portfolio JSON is empty.');
        }
    }
    else { // autosave
        checkPortfolioContentChanges(situation);
    }
    
    
    function setupAutosaveTimer(situation) {
        var timerID = setInterval(function() {
            checkPortfolioContentChanges(situation);
        }, 5000);
        $('body').data('autosave-timer', timerID);
    }
    
    function constructPortfolioHTML() {
        var userPortfolioHTML = '\
            <div id="fullpage" class="edit">\
                <section id="portfolio">\
                    <div class="container">\
                        <form class="form-horizontal row"></form>\
                    </div>\
                </section>\
            </div>';
                
        $('body').data('page', 'uPortfolio');
        console.log('page: uPortfolio');
        
        $('#page-content-wrapper').append(userPortfolioHTML);

        $('#navbar-top-layer-2 .back').attr('link', '/user/portfolios');
        $('#navbar-top-layer-2 .preview').attr('link', '/portfolio/' + globalPortfolioID);
    }
    
    
    function initPortfolioData(json) {
        $('#navbar-top-layer-2 .title a').text(json.title)
            .attr('href', '/user/portfolio/' + globalPortfolioID);

        // title + intro
    }

    function initPortfolioContent(json) {
        var $this = $('#portfolio .form-horizontal');

        var userPortfolioTextHTML = '\
            <div id="text-group" class="group text-group col-xs-12 col-md-10 col-md-offset-1 col-lg-8 col-lg-offset-2">\
                <div class="form-group">\
                    <div class="col-sm-12">\
                        <div id="summernote-text" class="summernote"></div>\
                    </div>\
                </div>\
            </div>';

        $this.append(userPortfolioTextHTML);
        initSummernotePost('#summernote-text');

        // set portfolio components
        $('#summernote-text').summernote('code', json);
        
        var portfolioComponentsJSON = JSON.stringify(json);
        $this.data('JSONData', portfolioComponentsJSON);
    }
    

    function eventHandlerPortfolio() {
        $('#navbar-top-layer-2').on('click', '.back', function() {
            page($(this).attr('link'));
        });
        
        $('#navbar-top-layer-2').on('click', '.preview', function() {
            window.open($(this).attr('link'), '_blank');
        });

        // http://summernote.org/deep-dive/#onchange
        $('#fullpage').on('summernote.change', function() {
            $.fn.fullpage.reBuild();
        });
    }

    function checkPortfolioContentChanges(situation) {
        var $this = $('#portfolio .group');
        var content = $('#summernote-text').summernote('code');

        var newJSONData = JSON.stringify(content);
        var oldJSONData = $('#portfolio .form-horizontal').data('JSONData');

        updatePortfolio(2, newJSONData, oldJSONData, situation);
    }


    function updatePortfolio(category, newJSONData, oldJSONData, situation) {
        if (newJSONData != oldJSONData) {
            console.log('Before: ' + oldJSONData);
            console.log('After: ' + newJSONData);

            if (globalPortfolioID != '-1') { // existing post
                updatePortfolioJSON(category, newJSONData, situation);
            }
            else if (!$('body').hasClass('processing')) { // new post
                $('body').addClass('processing');
                insertPortfolioJSON(category, newJSONData);
            }
        }
    }
            
    function insertPortfolioJSON(category, JSONData) {
        $.ajax({
            type: 'POST',
            url: '/insertPortfolioJSON/' + category,
            data: JSONData,
            contentType: 'application/json; charset=utf-8',
            dataType: 'json',
            cache: false
        }).done(function(json, textStatus, jqXHr) {
            setPortfolioData(category, json);
            globalPortfolioID = json.portfolioID;
            
            // https://developer.mozilla.org/en-US/docs/Web/API/History_API#The_pushState()_method
            history.replaceState({}, document.title, '/user/portfolio/' + globalPortfolioID);
            $('#navbar-top-layer-2 .preview').attr('link', '/portfolio/' + globalPortfolioID);
        }).fail(function(jqXHr, textStatus, errorThrown) {
            handleAjaxError(jqXHr, textStatus);
        }).always(function(json) {
            $('body').removeClass('processing');
        });
    }

    function updatePortfolioJSON(category, JSONData, situation) {
        $.ajax({
            type: 'POST',
            url: '/updatePortfolioJSON/' + category + '/' + globalPortfolioID,
            data: JSONData,
            contentType: 'application/json; charset=utf-8',
            dataType: 'json',
            cache: false
        }).done(function(json, textStatus, jqXHr) {
            if (situation == 0) { // normal update
                setPortfolioData(category, json);
            }
        }).fail(function(jqXHr, textStatus, errorThrown) {
            handleAjaxError(jqXHr, textStatus);
        }).always(function() {});
    }
    
    
    function setPortfolioData(category, json) {
        switch (category) {
            case 1: // settings
                break;
            case 2: // content
                var JSONData = JSON.stringify(json.content);
                $('#portfolio .form-horizontal').data('JSONData', JSONData);

                break;
            default:
                console.log('Error: set portfolio data category not matched.');
        }
    }
}
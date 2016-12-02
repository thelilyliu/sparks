function loadPortfolioInit(json, json2, situation) {
    if (situation == 0) { // normal load
        constructPortfolioHTML();

        if (!jQuery.isEmptyObject(json)) { // JSON is not empty
            initPortfolioData(json[0]);
            initPortfolioHeader(json[0]);
            initPortfolioContent(json[0].content);

            initializeFullPagePost();
            eventHandlerPortfolio();
            eventHandlerImage();
            setupAutosaveTimer(situation);
        }
        else { // error
            console.log('Portfolio: load portfolio JSON is empty.');
        }
    }
    else { // autosave
        checkPortfolioHeaderChanges(situation);
        checkPortfolioContentChanges(situation);
    }
    
    
    function setupAutosaveTimer(situation) {
        var timerID = setInterval(function() {
            checkPortfolioHeaderChanges(situation);
            checkPortfolioContentChanges(situation);
        }, 5000);
        $('body').data('autosave-timer', timerID);
    }
    
    function constructPortfolioHTML() {
        var userPortfolioHTML = '\
            <div id="fullpage" class="edit">\
                <section id="portfolio">\
                    <div class="container">\
                        <h1>Portfolio</h1>\
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
    }

    function initPortfolioHeader(json) {
        var userPortfolioHeaderHTML = '\
            <div id="header" class="col-xs-12 col-md-10 col-md-offset-1 col-lg-8 col-lg-offset-2">\
                <div class="form-group">\
                    <label for="inputHeadline" class="col-sm-3 control-label">Headline</label>\
                    <div class="col-sm-9">\
                        <input type="headline" class="form-control" id="inputHeadline" placeholder="Headline">\
                    </div>\
                </div>\
                <div class="form-group">\
                    <label for="inputIntro" class="col-sm-3 control-label">Intro</label>\
                    <div class="col-sm-9">\
                        <textarea type="intro" class="form-control" id="inputIntro" placeholder="Intro" rows=3></textarea>\
                    </div>\
                </div>\
                <div class="form-group image-processing">\
                    <label for="inputPortfolioBackground" class="col-sm-3 control-label">Background</label>\
                    <div class="col-sm-3">\
                        <label class="file" id="inputPortfolioBackground">\
                            <input type="file" id="upload-portfolio" class="upload" accept="image/*">\
                            <button class="btn btn-default upload">\
                                <i class="fa fa-upload" aria-hidden="true"></i>&nbsp; Upload\
                            </button>\
                            <button class="btn btn-default save">\
                                <i class="fa fa-floppy-o" aria-hidden="true"></i>&nbsp; Save\
                            </button>\
                        </label>\
                    </div>\
                    <div class="col-sm-6">\
                        <div class="thumbnail">\
                            <img id="portfolioBackground" class="img-responsive">\
                        </div>\
                    </div>\
                </div>\
            </div>';

        $('#portfolio .form-horizontal').append(userPortfolioHeaderHTML);

        var imageURL = '/images/portfolio/' + getImageSize() + '/' + json.background;

        // set portfolio header
        $('#inputHeadline').val(json.headline);
        $('#inputIntro').val(json.intro);
        $('#portfolioBackground').prop('src', imageURL);

        // get portfolio header JSON
        var portfolioHeader = {
            headline: json.headline,
            intro: json.intro
            // background: json.background
        };
        
        var portfolioHeaderJSON = JSON.stringify(portfolioHeader);
        $('#portfolio #header').data('JSONData', portfolioHeaderJSON);
    }

    function initPortfolioContent(json) {
        var userPortfolioContentHTML = '\
            <div id="content" class="col-xs-12 col-md-10 col-md-offset-1 col-lg-8 col-lg-offset-2">\
                <div class="form-group">\
                    <div class="col-sm-12">\
                        <div id="summernote-text" class="summernote"></div>\
                    </div>\
                </div>\
            </div>';

        $('#portfolio .form-horizontal').append(userPortfolioContentHTML);
        initSummernotePost('#summernote-text');

        // set portfolio components
        $('#summernote-text').summernote('code', json);
        
        var portfolioContentJSON = JSON.stringify(json);
        $('#portfolio #content').data('JSONData', portfolioContentJSON);
    }
    

    function readURL(input) {
        if (input.files && input.files.length) {
            var reader = new FileReader();
            
            reader.onload = function(e) {
                $('#portfolioBackground').prop('src', e.target.result);
            };
            
            reader.readAsDataURL(input.files[0]);
        }
        else {
            $('#portfolioBackground').prop('src', '');
        }
    }

    function uploadImage(input, category) {
        var xhr = new XMLHttpRequest();
        var url = '/uploadPortfolioImage/' + category + '/' + globalPortfolioID;
        var fd = new FormData();
        
        fd.append('uploadFile', input.files[0]);       
        xhr.open('POST', url, true);
        
        xhr.onreadystatechange = function() {
            if (xhr.readyState == 4 && xhr.status == 200) { // file upload success
                if (xhr.responseText != 'fail') { // successful upload
                    // http://hoxxep.github.io/snarl/
                    Snarl.addNotification({
                        text: 'Image successfully saved!',
                        icon: '<i class="fa fa-thumbs-o-up"></i>',
                        timeout: 5000
                    });
                }
                else { // unsuccessful upload
                    // http://hoxxep.github.io/snarl/
                    var noTimeoutNotification = null;

                    if (Snarl.isDismissed(noTimeoutNotification)) {
                        noTimeoutNotification = Snarl.addNotification({
                            text: 'Image could not be saved at this time. Please try again later.',
                            icon: '<i class="fa fa-exclamation-circle"></i>',
                            timeout: null
                        });
                    }
                }
            }
        };
        
        xhr.send(fd);
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

    function eventHandlerImage() {
        $('#fullpage').on('change', '.image-processing input.upload', function() {
            readURL(this);
        });

        $('#fullpage').on('click', '.image-processing button.save', function(e) {
            e.preventDefault();

            var input;
            var $section = $(this).closest('section');
            // var categoryStr = $section.attr('data-anchor').substr(7);
            // var categoryInt = parseInt(categoryStr);
            var categoryInt = 1;

            switch(categoryInt) {
                case 1:
                    input = document.querySelector('#upload-portfolio');
                    break;
                default:
                    console.log('Error: event handler image category not matched.');
            }
            
            if (input.files && input.files.length) {
                uploadImage(input, categoryInt);
            }
        });
    }


    function checkPortfolioHeaderChanges(situation) {
        var header = {
            headline: $('#inputHeadline').val(),
            intro: $('#inputIntro').val()
        };

        var newJSONData = JSON.stringify(header);
        var oldJSONData = $('#portfolio #header').data('JSONData');

        updatePortfolio(2, newJSONData, oldJSONData, situation);
    }

    function checkPortfolioContentChanges(situation) {
        var content = $('#summernote-text').summernote('code');

        var newJSONData = JSON.stringify(content);
        var oldJSONData = $('#portfolio #content').data('JSONData');

        updatePortfolio(3, newJSONData, oldJSONData, situation);
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
            case 2: // header
                var data = {
                    headline: json.headline,
                    intro: json.intro
                };

                var JSONData = JSON.stringify(data);
                $('#portfolio #header').data('JSONData', JSONData);

                break;
            case 3: // content
                var JSONData = JSON.stringify(json.content);
                $('#portfolio #content').data('JSONData', JSONData);

                break;
            default:
                console.log('Error: set portfolio data category not matched.');
        }
    }
}
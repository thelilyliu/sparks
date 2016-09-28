function loadPortfolioInit(json, json2, situation) {
    if (situation == 0) { // normal load
        constructPortfolioHTML();

        if (!jQuery.isEmptyObject(json)) { // JSON is not empty
            initPortfolioData(json[0]);
            initPortfolioComponents(json[0].components);

            eventHandlerPortfolio();
            setupAutosaveTimer(situation);
        }
        else { // error
            console.log('Portfolio: load portfolio JSON is empty.');
        }
    }
    else { // autosave
        // checkPortfolioProfileTypeChanges(situation);
    }
    
    
    function setupAutosaveTimer(situation) {
        var timerID = setInterval(function() {
            checkPortfolioComponentsChanges(situation);
        }, 5000);
        $('body').data('autosave-timer', timerID);
    }
    
    function constructPortfolioHTML() {
        var userPortfolioHTML = '\
            <div id="main-container" class="edit">\
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

        // title + intro
    }
    
    function initPortfolioComponents(json) {
        console.log('components');
        
        var $this = $('#portfolio .form-horizontal');
        var componentsArray = [];
        
        if (json != null && json.length > 0) { // not undefined or empty
            // http://stackoverflow.com/questions/979256/sorting-an-array-of-javascript-objects
            json.sort(function(a, b) {
                return a.order - b.order;
            });
            
            $.each(json, function(i, component) {
                switch (component.category) {
                    case 1:
                        console.log('text');

                        var userPortfolioTextHTML = '\
                            <div id="text-group' + (i + 1) + '" class="group text-group col-xs-12 col-sm-10 col-sm-offset-1 col-md-8 col-md-offset-2 col-lg-6 col-lg-offset-3">\
                                <div class="button-group">\
                                    <button type="button" class="move up default" aria-label="Up"><i class="fa fa-chevron-up"></i></button>\
                                    <button type="button" class="delete default" aria-label="Close"><i class="fa fa-times"></i></button>\
                                    <button type="button" class="move down default" aria-label="Down"><i class="fa fa-chevron-down"></i></button>\
                                </div>\
                                <div class="form-group">\
                                    <div class="col-sm-12">\
                                        <div id="summernote-text' + (i + 1) + '" class="summernote"></div>\
                                    </div>\
                                </div>\
                            </div>';

                        $this.append(userPortfolioTextHTML);
                        initSummernote('#summernote-text' + (i + 1));

                        // set portfolio components
                        $('#summernote-text' + (i + 1)).summernote('code', component.content);
                        $('#text-group' + (i + 1)).attr('order', component.order);
                        
                        break;
                    case 2:
                        console.log('image');
                        
                        var userPortfolioImageHTML = '\
                            <div id="image-group' + (i + 1) + '" class="group image-group col-xs-12 col-sm-10 col-sm-offset-1 col-md-8 col-md-offset-2 col-lg-6 col-lg-offset-3">\
                                <div class="button-group">\
                                    <button type="button" class="move up default" aria-label="Up"><i class="fa fa-chevron-up"></i></button>\
                                    <button type="button" class="delete default" aria-label="Close"><i class="fa fa-times"></i></button>\
                                    <button type="button" class="move down default" aria-label="Down"><i class="fa fa-chevron-down"></i></button>\
                                </div>\
                                <div class="form-group">\
                                    <div class="col-sm-12">\
                                        <img id="image' + (i + 1) + '" class="image"></div>\
                                    </div>\
                                </div>\
                            </div>';

                        $this.append(userPortfolioImageHTML);

                        // set portfolio components
                        $('#image' + (i + 1)).attr('src', component.content);
                        $('#image-group' + (i + 1)).attr('order', component.order);

                        break;
                    default:
                        console.log('Error: init portfolio components category not matched.');
                }

                // get portfolio component JSON
                var portfolioComponent = {
                    category: component.category,
                    content: component.content,
                    order: component.order
                };

                componentsArray.push(portfolioComponent);
            });

            $this.find('.group').first().addClass('first');
            $this.find('.group').last().addClass('last');
        }
        else {
            var category = 2;

            switch (category) {
                case 1:
                    addTextGroup();

                    // get portfolio component JSON
                    var portfolioTextComponent = {
                        category: 1,
                        content: '<p></p>',
                        order: 0
                    };

                    componentsArray.push(portfolioTextComponent);

                    break;
                case 2:
                    addImageGroup();

                    // get portfolio component JSON
                    var portfolioImageComponent = {
                        category: 1,
                        content: '/images/BNUELLTI5U.jpg',
                        order: 0
                    };

                    componentsArray.push(portfolioImageComponent);

                    break;
                default:
                    console.log('Error: add new component category not matched.');
            }
        }
        
        var portfolioComponentsJSON = JSON.stringify(componentsArray);
        $this.data('JSONData', portfolioComponentsJSON);
    }
    
    
    function addTextGroup() {
        var i = $('.group').length;
        
        var userPortfolioTextHTML = '\
            <div id="text-group' + (i + 1) + '" class="group text-group col-xs-12 col-sm-10 col-sm-offset-1 col-md-8 col-md-offset-2 col-lg-6 col-lg-offset-3">\
                <div class="button-group">\
                    <button type="button" class="move up default" aria-label="Up"><i class="fa fa-chevron-up"></i></button>\
                    <button type="button" class="delete default" aria-label="Close"><i class="fa fa-times"></i></button>\
                    <button type="button" class="move down default" aria-label="Down"><i class="fa fa-chevron-down"></i></button>\
                </div>\
                <div class="form-group">\
                    <div class="col-sm-12">\
                        <div id="summernote-text' + (i + 1) + '" class="summernote"></div>\
                    </div>\
                </div>\
            </div>';

        $('#portfolio .form-horizontal').append(userPortfolioTextHTML);
        $('#text-group' + (i + 1)).attr('order', i);

        initSummernote('#summernote-text' + (i + 1));
        $('#summernote-text' + (i + 1)).summernote('code', '<p></p>');
    }

    function addImageGroup() {
        var i = $('.group').length;

        var userPortfolioImageHTML = '\
            <div id="image-group' + (i + 1) + '" class="group image-group col-xs-12 col-sm-10 col-sm-offset-1 col-md-8 col-md-offset-2 col-lg-6 col-lg-offset-3">\
                <div class="button-group">\
                    <button type="button" class="move up default" aria-label="Up"><i class="fa fa-chevron-up"></i></button>\
                    <button type="button" class="delete default" aria-label="Close"><i class="fa fa-times"></i></button>\
                    <button type="button" class="move down default" aria-label="Down"><i class="fa fa-chevron-down"></i></button>\
                </div>\
                <div class="form-group">\
                    <div class="col-sm-12">\
                        <img id="image' + (i + 1) + '" class="image" src="/images/101.jpg"></div>\
                    </div>\
                </div>\
            </div>';

        $('#portfolio .form-horizontal').append(userPortfolioImageHTML);
        $('#image-group' + (i + 1)).attr('order', i);
    }
    

    function eventHandlerPortfolio() {
        $('#navbar-top-layer-2').on('click', '.back', function() {
            page($(this).attr('link'));
        });
        
        $('#navbar-top-layer-2').on('click', '.preview', function() {
            window.open($(this).attr('link'), '_blank');
        });

        $('#fullpage').on('click', 'button.move', function() {
            var $this = $(this);
            var $item = $this.closest('.group');
            var $form = $this.closest('.form-horizontal');
            var order = $item.attr('order');
            
            if ($this.hasClass('up')) {
                $item.attr('order', (order - 1));
                $item.prev().attr('order', order);
                
                $item.swapWith($item.prev());
            }
            else {
                $item.attr('order', (order + 1));
                $item.next().attr('order', order);
                
                $item.swapWith($item.next());
            }

            $form.find('.first').removeClass('first'); // reset order of classes
            $form.find('.last').removeClass('last');
            $form.find('.group').first().addClass('first'); // set order of classes
            $form.find('.group').last().addClass('last');
        });

        $('#fullpage').on('click', 'button.delete', function(e) {
            e.stopPropagation();

            var $this = $(this).closest('.group');
            $this.fadeOut(500, function() {
                $this.remove();
                $.fn.fullpage.reBuild();
                $('.group').last().addClass('last');
            });
        });
        
        $('#experience').on('click', 'button.new-paragraph', function() {
            /*
            $('.experience-group').last().removeClass('last');
            addExperienceGroup();
            $.fn.fullpage.reBuild();
            $('.experience-group').last().addClass('last');
            */
        });

        $('#experience').on('click', 'button.new-image', function() {
            /*
            $('.experience-group').last().removeClass('last');
            addExperienceGroup();
            $.fn.fullpage.reBuild();
            $('.experience-group').last().addClass('last');
            */
        });
    }

    function checkPortfolioComponentsChanges(situation) {
        var $this = $('#portfolio .group');
        var componentsArray = [];
        
        $.each($this, function(i, component) {
            var data = {};

            if ($this.hasClass('text-group')) {
                data = {
                    category: 1,
                    content: $('#summernote-text' + (i + 1)).summernote('code'),
                    order: parseInt($('#text-group' + (i + 1)).attr('order'))
                };
            }
            else if ($this.hasClass('image-group')) {
                data = {
                    category: 1,
                    content: $('#image' + (i + 1)).attr('src'),
                    order: parseInt($('#image-group' + (i + 1)).attr('order'))
                };
            }
            else {
                console.log('Error: portfolio category not matched.');
            }
            
            componentsArray.push(data);
        });

        var newJSONData = JSON.stringify(componentsArray);
        var oldJSONData = $('#portfolio .form-horizontal').data('JSONData');

        updatePortfolio(8, newJSONData, oldJSONData, situation);
    }


    function updatePortfolio(category, newJSONData, oldJSONData, situation) {
        if (newJSONData != oldJSONData) {
            console.log('Before: ' + oldJSONData);
            console.log('After: ' + newJSONData);

            if (globalPortfolioID != '-1') { // existing post
                //updatePortfolioJSON(category, newJSONData, situation);
            }
            else if (!$('body').hasClass('processing')) { // new post
                //$('body').addClass('processing');
                //insertPortfolioJSON(category, newJSONData);
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
            default:
                console.log('Error: updatePortfolioJSON category not matched.');
        }
    }
}
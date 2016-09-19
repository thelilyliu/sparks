function loadDashboardResumesInit(json, json2, situation) {
    constructDashboardResumesHTML();
    initMasonry();

    if (!jQuery.isEmptyObject(json)) { // JSON is not empty
        initDashboardResumesData(json[0].resumeInfo);
        eventHandlerDashboardResumes();
    }
    else { // error
        console.log('Dashboard resumes: load dashboard resumes JSON is empty.');
    }

    function constructDashboardResumesHTML() {
        var containerHTML = '\
            <div id="main-container">\
                <section id="resumes">\
                    <div class="container">\
                        <h1>Resumes</h1>\
                        <div class="grid">\
                            <div class="grid-sizer"></div>\
                        </div>\
                    </div>\
                </section>\
            </div>';

        var resumeButtonHTML = '\
            <button id="new-resume" type="button" class="default new">\
                <i class="fa fa-plus absolute-center vertical-align"></i>\
            </button>';
        
        $('body').data('page', 'uDashboardResumes');
        console.log('page: uDashboardResumes');
        
        $('#page-content-wrapper').append(containerHTML);
        $('#resumes .container').prepend(resumeButtonHTML);
        
        $('#resumes #new-resume').data('link', '/user/resume/-1/#section1');
    }

    function initDashboardResumesData(json) {
        $.each(json, function(i, resume) {
            var resumeHTML = '\
                <div class="grid-item card-wrapper">\
                    <div class="card">\
                        <div class="card-cover">\
                            <div class="img-wrapper">\
                                <img src="/images/BNUELLTI5U.jpg">\
                            </div>\
                            <div class="card-actions fill-div">\
                                <div class="date">\
                                    <h4>' + getFormattedDate(resume.date) + '</h4>\
                                </div>\
                                <div class="card-action-item-wrapper">\
                                    <div class="card-action-item share">\
                                        <i class="fa fa-share-square-o"></i>\
                                    </div>\
                                    <div class="card-action-item delete">\
                                        <i class="fa fa-trash-o"></i>\
                                    </div>\
                                </div>\
                            </div>\
                        </div>\
                        <div class="card-footer">\
                            <h3 class="title">' + resume.title + '</h3>\
                        </div>\
                    </div>\
                </div>';

                setTimeout(function() {
                    var $resume = $(resumeHTML);

                    var $grid = $('.grid').imagesLoaded().done(function() {
                        $grid.append($resume) // append items to grid
                            .masonry('appended', $resume) // add and lay out newly appended items
                            .masonry('layout');

                        $grid.find('.card').last()
                            .data('resumeID', resume.resumeID)
                            .data('link', '/user/resume/' + resume.resumeID + '#section1');
                    });
                }, 100);
        });
    }
    
    function deleteResumeJSON(resumeID, $this) {
        $.ajax({
            type: 'DELETE',
            url: '/deleteResumeJSON/' + resumeID,
            dataType: 'json',
            cache: false
        }).done(function(json, textStatus, jqXHr) {
            $this.closest('.card-wrapper').remove();
            initMasonry();
        }).fail(function(jqXHr, textStatus, errorThrown) {
            handleAjaxError(jqXHr, textStatus);
        }).always(function() {});
    }

    function eventHandlerDashboardResumes() {
        $('#resumes').on('click', '.card-cover', function() {
            page($(this).parent().data('link'));
        });

        $('#resumes').on('click', '#new-resume', function() {
            page($(this).data('link'));
        });
        
        $('#resumes').on('click', '.share', function(e) {
            e.stopPropagation();
            
            alert('Sharing is caring.');
        });

        $('#resumes').on('click', '.delete', function(e) {
            e.stopPropagation();

            if (confirm('Are you sure you want to delete this resume?')) {
                var $this = $(this);
                var resumeID = $this.closest('.card').data('resumeID');
                deleteResumeJSON(resumeID, $this);
            }
        });
        
        $('#resumes').on('dblclick', '.title', function() {
            var $this = $(this);
            
            var $input = $('<input type="text" class="form-control">').val($this.text());
            $this.replaceWith($input);
            
            $('.card-footer input').focus();
        });
        
        $('#resumes').on('click', '.card-footer input', function(e) {
            e.stopPropagation();
        });
        $('#resumes').on('blur', '.card-footer input', function() {
            var $this = $(this);
            var title = 'Untitled Resume';
            
            if ($this.val()) {
                title = $this.val();
            }
            
            var data = {
                title: title
            };
            
            var resumeID = $this.closest('.card').data('resumeID');
            var JSONData = JSON.stringify(data);
            updateResumeJSON(resumeID, JSONData);
            
            var $title = '<h3 class="title">' + title + '</h3>';
            $this.replaceWith($title);
            initMasonry();
        });
    }
    
    function updateResumeJSON(resumeID, JSONData) {
        $.ajax({
            type: 'POST',
            url: '/updateResumeJSON/1/' + resumeID,
            data: JSONData,
            contentType: 'application/json; charset=utf-8',
            dataType: 'json',
            cache: false
        }).done(function(json, textStatus, jqXHr) {
        }).fail(function(jqXHr, textStatus, errorThrown) {
            handleAjaxError(jqXHr, textStatus);
        }).always(function() {});
    }
}
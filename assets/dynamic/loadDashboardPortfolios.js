function loadDashboardPortfoliosInit(json, json2, situation) {
    constructDashboardPortfoliosHTML();
    initMasonry();

    if (!jQuery.isEmptyObject(json)) { // JSON is not empty
        initDashboardPortfoliosData(json[0].portfolioInfo);
        eventHandlerDashboardPortfolios();
    }
    else { // error
        console.log('Dashboard portfolios: load dashboard portfolios JSON is empty.');
    }

    function constructDashboardPortfoliosHTML() {
        var containerHTML = '\
            <div id="main-container">\
                <section id="portfolios">\
                    <div class="container">\
                        <h1>Portfolios</h1>\
                        <div class="grid">\
                            <div class="grid-sizer"></div>\
                        </div>\
                    </div>\
                </section>\
            </div>';

        var portfolioButtonHTML = '\
            <button id="new-portfolio" type="button" class="default new">\
                <i class="fa fa-plus absolute-center vertical-align"></i>\
            </button>';

        $('body').data('page', 'uDashboardPortfolios');
        console.log('page: uDashboardPortfolios');
        
        $('#page-content-wrapper').append(containerHTML);
        $('#portfolios .container').prepend(portfolioButtonHTML);
        
        $('#portfolios #new-portfolio').data('link', '/user/portfolio/-1');
    }

    function initDashboardPortfoliosData(json) {
        $.each(json, function(i, portfolio) {
            var portfolioHTML = '\
                <div class="grid-item card-wrapper">\
                    <div class="card">\
                        <div class="card-cover">\
                            <div class="img-wrapper">\
                                <img src="/images/7E6EE0EC76.jpg">\
                            </div>\
                            <div class="card-actions fill-div">\
                                <div class="date">\
                                    <h4>' + getFormattedDate(portfolio.date) + '</h4>\
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
                            <h3 class="title">' + portfolio.title + '</h3>\
                        </div>\
                    </div>\
                </div>';

            setTimeout(function() {
                var $portfolio = $(portfolioHTML);

                var $grid = $('.grid').imagesLoaded().done(function() {
                    $grid.append($portfolio) // append items to grid
                        .masonry('appended', $portfolio) // add and lay out newly appended items
                        .masonry('layout');

                    $grid.find('.card').last()
                        .data('portfolioID', portfolio.portfolioID)
                        .data('link', '/user/portfolio/' + portfolio.portfolioID);
                });
            }, 100);
        });
    }

    function deletePortfolioJSON(portfolioID, $this) {
        $.ajax({
            type: 'DELETE',
            url: '/deletePortfolioJSON/' + portfolioID,
            dataType: 'json',
            cache: false
        }).done(function(json, textStatus, jqXHr) {
            $this.closest('.card-wrapper').remove();
            initMasonry();
        }).fail(function(jqXHr, textStatus, errorThrown) {
            handleAjaxError(jqXHr, textStatus);
        }).always(function() {});
    }

    function eventHandlerDashboardPortfolios() {
        $('#portfolios').on('click', '.card-cover', function() {
            page($(this).parent().data('link'));
        });

        $('#portfolios').on('click', '#new-portfolio', function() {
            page($(this).data('link'));
        });
        
        $('#portfolios').on('click', '.share', function(e) {
            e.stopPropagation();
            
            alert('Sharing is caring.');
        });

        $('#portfolios').on('click', '.delete', function(e) {
            e.stopPropagation();

            if (confirm('Are you sure you want to delete this portfolio?')) {
                var $this = $(this);
                var portfolioID = $this.closest('.card').data('portfolioID');
                deletePortfolioJSON(portfolioID, $this);
            }
        });
        
        $('#portfolios').on('dblclick', '.title', function() {
            var $this = $(this);
            
            var $input = $('<input type="text" class="form-control">').val($this.text());
            $this.replaceWith($input);
            
            $('.card-footer input').focus();
        });
        
        $('#portfolios').on('click', '.card-footer input', function(e) {
            e.stopPropagation();
        });
        $('#portfolios').on('blur', '.card-footer input', function() {
            var $this = $(this);
            var title = 'Untitled Portfolio';
            
            if ($this.val()) {
                title = $this.val();
            }
            
            var data = {
                title: title
            };
            
            var portfolioID = $this.closest('.card').data('portfolioID');
            var JSONData = JSON.stringify(data);
            updatePortfolioJSON(portfolioID, JSONData);
            
            var $title = '<h3 class="title">' + title + '</h3>';
            $this.replaceWith($title);
            initMasonry();
        });
    }

    function updatePortfolioJSON(portfolioID, JSONData) {
        $.ajax({
            type: 'POST',
            url: '/updatePortfolioJSON/1/' + portfolioID,
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
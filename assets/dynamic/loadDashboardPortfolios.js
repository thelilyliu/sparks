function loadDashboardPortfoliosInit(json, json2, situation) {
    constructDashboardPortfoliosHTML();

    if (!jQuery.isEmptyObject(json)) { // JSON is not empty
        initDashboardPortfoliosData(json[0].portfolioInfo);
        initMasonry();
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
            <button id="new-portfolio" type="button" class="default new-button">\
                <i class="fa fa-plus absolute-center vertical-align"></i>\
            </button>';

        $('body').data('page', 'uDashboardPortfolios');
        console.log('page: uDashboardPortfolios');
        
        $('#page-content-wrapper').append(containerHTML);
        $('#portfolios .container').append(portfolioButtonHTML);
        
        $('#portfolios #new-portfolio').data('link', '/user/portfolio/-1');
    }

    function initDashboardPortfoliosData(json) {
        $.each(json, function(i, portfolio) {
            var portfolioHTML = '\
                <div class="card-wrapper col-xs-12 col-sm-6 col-lg-4">\
                    <div class="card">\
                        <div class="card-cover">\
                            <img src="/images/stocksnap/3J7DMT7754.jpg">\
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
                            <h3 class="title">' + portfolio.title + '</h3>\
                        </div>\
                    </div>\
                </div>';

            $('#portfolio .row').append(portfolioHTML);
            $('#portfolios .row .card').last()
                .data('portfolioID', portfolio.portfolioID)
                .data('link', '/user/portfolio/' + portfolio.portfolioID);
        });
    }
}
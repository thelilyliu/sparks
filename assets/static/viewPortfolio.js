function viewPortfolioInit() {
    $.ajax({
        type: 'GET',
        url: '/viewPortfolioJSON/' + globalPortfolioID,
        dataType: 'json',
        timeout: ajaxDynamicTimeout,
        cache: false
    }).done(function(json, textStatus, jqXHr) {
        if (!jQuery.isEmptyObject(json)) { // JSON is not empty
            initPortfolioHeaderData(json);
            initPortfolioContentData(json.content);

            eventHandlerPortfolio();
        }
        else { // error
            console.log('Resume: load resume JSON is empty.');
        }
    }).fail(function(jqXHr, textStatus, errorThrown) {
        handleAjaxError(jqXHr, textStatus);
    }).always(function() {});

    function initPortfolioHeaderData(json) {
        var portfolioHeaderHTML = '\
            <div id="header" class="col-xs-12 col-md-10 col-md-offset-1 col-lg-8 col-lg-offset-2">\
                <h1>' + json.headline + '</h1>\
                <p>' + json.intro + '</p>\
            </div>';

        var imageURL = '/images/portfolio/' + getImageSize() + '/' + json.background;

        $('#main-container .container .row').append(portfolioHeaderHTML);
        $('#main-container').css('background-image', 'url("' + imageURL + '")')
                .css('background-size', 'cover');
    }
    
    function initPortfolioContentData(json) {
        var portfolioContentHTML = '\
            <div id="content" class="col-xs-12 col-md-10 col-md-offset-1 col-lg-8 col-lg-offset-2">' + json + '</div>';
        
        $('#main-container .container .row').append(portfolioContentHTML);
    }
    
    function eventHandlerPortfolio() {
        
    }
}
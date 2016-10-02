function viewPortfolioInit() {
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
    
    function eventHandlerPortfolio() {
        
    }
}
var ajaxHtmlScriptTimeout = 30000;
var ajaxDynamicTimeout = 30000;
var ajaxJSFolder = '/assets/dynamic/';

var jsArray = {}; // js array script storage, used with loadScript to store script path and file name so it will not load twice

function scriptGetAjax(url) {
    if (url && (!jsArray[url])) {
        jsArray[url] = true;
 
        return $.ajax({
            type: 'GET',
            url: url,
            dataType: 'script',
            timeout: ajaxHtmlScriptTimeout,
            cache: true // (warning: setting it to false will cause a timestamp and will call the request twice)
        });
    }
}

function apiGetAjax(url) {
    return $.ajax({
        type: 'GET',
        url: url,
        dataType: 'json',
        timeout: ajaxDynamicTimeout,
        cache: false
    });
}

function loadURL(url, command, docID) {
    var dataURL1 = '';
    var getData1 = '';
    var dataURL2 = '';
    var getData2 = '';
    var scriptURL1 = '';
    var getScript1 = '';
    
    // remove alerts
    $('.alert').hide();
    
    // synchronize side menu with url
    $('#sidebar-wrapper ul').css('display', '');
    $('#sidebar-wrapper li.active').removeClass('active').removeClass('open');
    $('#sidebar-wrapper li:has(a[href="' + url + '"])').addClass('active').addClass('open');
    
    if (command == 'loadResume') {
        $('#sidebar-wrapper li.nav-resumes').addClass('active').addClass('open');
    }
    else if (command == 'loadPortfolio') {
        $('#sidebar-wrapper li.nav-portfolios').addClass('active').addClass('open');
    }

    // close side menu
    $('[data-uw-action="sidebar-open"]').removeClass('toggled');
    $('#sidebar-wrapper').removeClass('toggled');
    
    var selection = document.querySelector('#dynamic-sidebar-style');
    if (selection) {
        selection.textContent = '';
    }
    
    $('#page-content-wrapper').removeClass('toggled');
    $('#sidebar-backdrop').remove();

    switch (command) {
        case 'loadDashboardResumes':
        case 'loadDashboardPortfolios':
        case 'loadSettings':
            dataURL1 = '/' + command + 'JSON';
            break;
        case 'loadResume':
        case 'loadPortfolio':
            dataURL1 = '/' + command + 'JSON/' + docID;
            break;
    }
 
    if (dataURL1) {
        getData1 = apiGetAjax(dataURL1);
    }

    /*
    If two concurrent requests are made for the same session, the first request gets exclusive access to the session information. The second request executes only after the first request is finished. The second session can also get access if the exclusive lock on the information is freed because the first request exceeds the lock time-out (500ms). IIS 7 has a bug, it always lock for 500ms, even the first request is finished. The workaroud way call second request after first request finished in ajax.
    */
    
    if (dataURL2) {
        if (getData1) {
            getData2 = getData1.then(function(data) {
                return apiGetAjax(dataURL2);
            });
        }
        else {
            getData2 = apiGetAjax(dataURL2);
        }
    }
 
    // load script
    scriptURL1 = ajaxJSFolder + '/' + command + '.js';
    
    getScript1 = scriptGetAjax(scriptURL1);
 
    $.when(getData1, getData2, getScript1).done(function(json, json2) {
        // remove modal-open class if it exists, the modal-open class will remain in body in chrome on android phone sometimes; even there is no modal, this will cause page can not scroll, remove it just in case
        if (($('body .modal-backdrop').length == 0) && $('body').hasClass('modal-open')) {
            $('body').removeClass('modal-open');
        }
        
        clearContainer();
        
        if (window[command + 'Init']) { // initialize page
            window[command + 'Init'](json, json2, 0);
        }
    }).fail(function (jqXHr, textStatus, errorThrown) {
        handleAjaxError(jqXHr, textStatus);
    }).always(function () {
        // $('body').removeClass('processing');
    });
}

function handleAjaxError(jqXHr, textStatus) {
    var message = '';
 
    switch (textStatus) {
        case 'notmodified':
            message = 'Not Modified';
            break;
        case 'parsererror':
            message = 'Parser Error';
            break;
        case 'timeout':
            message = 'Time Out';
            break;
        default:
            switch (jqXHr.status) {
                case 398: // error
                    if (jqXHr.responseJSON) {
                        message = jqXHr.responseJSON.message;
                    }
                    else {
                        message = '398 Error';
                    }
                    
                    break;
                case 401: // unauthorized
                    if (jqXHr.responseJSON) {
                        message = jqXHr.responseJSON.message;
                    }
                    else {
                        message = '401 Unauthorized';
                    }
                    
                    break;
                case 403: // forbidden
                    if (jqXHr.responseJSON) {
                        message = jqXHr.responseJSON.message;
                    }
                    else {
                        message = '403 Forbidden';
                    }
                    window.location.pathname = '/login';
                    
                    break;
                case 404: // not found
                    if (jqXHr.responseJSON) {
                        message = jqXHr.responseJSON.message;
                    }
                    else {
                        message = '404 Not Found';
                    }
                    
                    break;
                case 500: // internal server error
                    if (jqXHr.responseJSON) {
                        message = jqXHr.responseJSON.message;
                    }
                    else {
                        message = '500 Internal Server Error';
                    }
                    
                    break;
                case 503: // service unavailable
                    if (jqXHr.responseJSON) {
                        message = jqXHr.responseJSON.message;
                    }
                    else {
                        message = '503 Service Unavailable';
                    }
                    
                    break;
                default:
                    message = 'Error';
            }
    }
    
    if (message) {
        console.log('Error: ' + message);
        displayAlertMessage(message);
    }
}

function displayAlertMessage(message) {
    var alertMessageHTML = '\
        <div class="alert alert-warning alert-dismissible fade in" role="alert">\
            <button type="button" class="close default" data-dismiss="alert" aria-label="Close"><span aria-hidden="true">&times;</span></button>' + message + '\
        </div>';
    
    $('body').append(alertMessageHTML);
}

function initMasonry() {
    $('.grid').masonry({
        itemSelector: '.grid-item',
        columnWidth: '.grid-sizer',
        percentPosition: true
    });
}

function initSummernote(selector) {
    // http://summernote.org/deep-dive/
    $(selector).summernote({
        lang: 'en-US',
        minHeight: 100,
        dialogsInBody: true,
        disableDragAndDrop: true,
        toolbar: [
            ['style', ['bold', 'italic', 'underline']],
            ['color', ['color']],
            ['para', ['ul', 'ol', 'paragraph']],
        ]
    });
}

function initSummernotePost(selector) {
    // http://summernote.org/deep-dive/
    $(selector).summernote({
        lang: 'en-US',
        minHeight: 200,
        dialogsInBody: true,
        disableDragAndDrop: true,
        toolbar: [
            ['style', ['bold', 'italic', 'underline']],
            ['color', ['color']],
            ['para', ['ul', 'ol', 'paragraph']],
            ['fontsize', ['fontsize']],
            ['insert', ['picture', 'link', 'video']],
            ['misc', ['undo', 'redo']]
        ]
    });
}

function setScreenSize() {
    var size = '';

    if (window.matchMedia && window.matchMedia('(max-width: 767px)').matches) {
        size = 'extra-small';
    }
    else if (window.matchMedia && window.matchMedia('(max-width: 991px)').matches) {
        size = 'small';
    }
    else if (window.matchMedia && window.matchMedia('(max-width: 1199px)').matches) {
        size = 'medium';
    }
    else {
        size = 'large';
    }
    
    $('body').attr('size', size);
}

function getImageSize() {
    var imageSize = '';
    var pageSize = $('body').attr('size');

    switch(pageSize) {
        case 'extra-small':
        case 'small':
            imageSize = 'small';
            break;

        case 'medium':
        case 'large':
            imageSize = 'large';
            break;

        default:
            console.log('Error: get image size page size not matched.');
    }

    return imageSize;
}

function clearContainer() {
    var page = $('body').data('page');
    
    if ($('body').data('autosave-timer')) {
        clearInterval($('body').data('autosave-timer'));
        $('body').removeData('autosave-timer');
    }
    
    switch (page) {
        case 'uSettings':
            loadSettingsInit('', '', 1);
            break;
        case 'uResume':
            loadResumeInit('', '', 1);
            break;
    }
    
    if ($('html').hasClass('fp-enabled')) {
        $.fn.fullpage.destroy('all');
        $('html').removeClass('fp-small').removeClass('fp-large');
    }

    $('#page-content-wrapper').empty();

    // clear everything except these key DOM elements
    // sometimes plugins will leave dynamic elements behind
    // $('body').find('> *').filter(':not(' + ignore_key_elms + ')').empty().remove();
}

// http://stackoverflow.com/questions/698301/is-there-a-native-jquery-function-to-switch-elements
jQuery.fn.swapWith = function(to) {
    return this.each(function() {
        var copy_to = $(to).clone(true);
        var copy_from = $(this).clone(true);
        $(to).replaceWith(copy_from);
        $(this).replaceWith(copy_to);
    });
};
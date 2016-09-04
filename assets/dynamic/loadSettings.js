function loadSettingsInit(json, json2, situation) {
    if (situation == 0) { // normal load
        constructSettingsHTML();

        if (!jQuery.isEmptyObject(json)) { // JSON is not empty
            initSettingsData(json[0]);
            setupAutosaveTimer(situation);
        }
        else { // error
            console.log('Settings: load settings JSON is empty.');
        }
    }
    else { // autosave
        checkSettingsChanges(situation);
    }
    
    function setupAutosaveTimer(situation) {
        var timerID = setInterval(function() {
            checkSettingsChanges(situation);
        }, 5000);
        $('body').data('autosave-timer', timerID);
    }

    function constructSettingsHTML() {
        var containerHTML = '\
            <div id="main-container">\
                <section id="settings">\
                    <div class="container">\
                        <h1>Settings</h1>\
                        <div class="row">\
                            <form class="form-horizontal"></form>\
                        </div>\
                    </div>\
                </section>\
            </div>';
        
        var settingsHTML = '\
            <div class="form-group">\
                <label for="inputFirstName3" class="col-sm-3 control-label">First Name</label>\
                <div class="col-sm-9">\
                    <input type="first-name" class="form-control" id="inputFirstName3" placeholder="First Name">\
                </div>\
            </div>\
            \
            <div class="form-group">\
                <label for="inputLastName3" class="col-sm-3 control-label">Last Name</label>\
                <div class="col-sm-9">\
                    <input type="last-name" class="form-control" id="inputLastName3" placeholder="Last Name">\
                </div>\
            </div>\
            \
            <div class="form-group">\
                <label for="inputEmail3" class="col-sm-3 control-label">Email</label>\
                <div class="col-sm-9">\
                    <input type="email" class="form-control" id="inputEmail3" placeholder="Email">\
                </div>\
            </div>\
            \
            <div class="form-group">\
                <label for="inputPassword3" class="col-sm-3 control-label">Password</label>\
                <div class="col-sm-9">\
                    <input type="password" class="form-control" id="inputPassword3" placeholder="Password">\
                </div>\
            </div>';

        $('body').data('page', 'uSettings');
        console.log('page: uSettings');
        
        $('#page-content-wrapper').append(containerHTML);
        $('#settings .form-horizontal').append(settingsHTML);
    }

    function initSettingsData(json) {
        var $this = $('#settings .form-horizontal');

        // set user settings
        $this.find('#inputFirstName3').val(json.firstName);
        $this.find('#inputLastName3').val(json.lastName);
        $this.find('#inputEmail3').val(json.email);
        $this.find('#inputPassword3').val(json.password);

        // get user settings JSON
        $this.data('JSONData', getJSONString());
    }

    function checkSettingsChanges(situation) {
        var newJSONData = getJSONString();
        var oldJSONData = $('#settings .form-horizontal').data('JSONData');

        if (newJSONData != oldJSONData) {
            console.log('Before: ' + oldJSONData);
            console.log('After: ' + newJSONData);
            updateSettingsJSON(newJSONData, situation);
        }
    }

    function updateSettingsJSON(JSONData, situation) {
        $.ajax({
            type: 'POST',
            url: '/updateUserJSON',
            data: JSONData,
            contentType: 'application/json; charset=utf-8',
            dataType: 'json',
            cache: false
        }).done(function(json, textStatus, jqXHr) {
            if (situation == 0) { // normal update
                $('#settings .form-horizontal').data('JSONData', JSONData);
            }
        }).fail(function(jqXHr, textStatus, errorThrown) {
            handleAjaxError(jqXHr, textStatus);
        }).always(function() {});
    }
    
    function getJSONString() {
        var $this = $('#settings .form-horizontal');
        
        var data = {
            firstName: $this.find('#inputFirstName3').val(),
            lastName: $this.find('#inputLastName3').val(),
            email: $this.find('#inputEmail3').val(),
            password: $this.find('#inputPassword3').val()
        };
        
        return JSON.stringify(data);
    }
}
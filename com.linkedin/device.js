// -*- mode: js; indent-tabs-mode: nil; js-basic-offset: 4 -*-
//
// Copyright 2016 Giovanni Campagna <gcampagn@cs.stanford.edu>
//
// See LICENSE for details

const Tp = require('thingpedia');

module.exports = new Tp.DeviceClass({
    Name: 'LinkedinDevice',
    UseOAuth2: Tp.Helpers.OAuth2({
        authorize: 'https://www.linkedin.com/uas/oauth2/authorization',
        get_access_token: 'https://www.linkedin.com/uas/oauth2/accessToken',
        set_state: true,

        callback: function(engine, accessToken, refreshToken) {
            var auth = 'Bearer ' + accessToken;
            return Tp.Helpers.Http.get('https://api.linkedin.com/v1/people/~:(id,formatted-name)?format=json',
                                       { auth: auth,
                                         accept: 'application/json' })
                .then(function(response) {
                    var parsed = JSON.parse(response);
                    return engine.devices.loadOneDevice({ kind: 'com.linkedin',
                                                          accessToken: accessToken,
                                                          refreshToken: refreshToken,
                                                          userId: parsed.id,
                                                          userName: parsed.formattedName
                                                        }, true);
                });
        }
    }),

    _init: function(engine, state) {
        this.parent(engine, state);

        this.uniqueId = 'com.linkedin-' + this.userId;
        this.name = "LinkedIn Account of %s".format(this.userName);
        this.description = "This is your LinkedIn account";
    },

    get userId() {
        return this.state.userId;
    },

    get userName() {
        return this.state.userName;
    },

    checkAvailable: function() {
        return Tp.Availability.AVAILABLE;
    }
});

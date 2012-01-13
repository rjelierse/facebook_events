/**
 * @file facebook-events.js
 *
 * @author Raymond Jelierse
 */

/**
 * Theme a single facebook event item
 */
Drupal.theme.prototype.facebookEvent = function(event) {
    // Facebook, in its infinite wisdom, decided all times should be PST.
    // Thus, subtract a configured timezone offset.
    date = new Date(event.start_time * 1000 - Drupal.settings.facebookEventsBlock.offset);
    now = new Date();

    if (now.toDateString() == date.toDateString()) {
        e = '<li class="event-item today">';
    }
    else {
        e = '<li class="event-item">';
    }

    event.link = 'http://www.facebook.com/event.php?eid=' + event.id;

    e += '<a rel="facebook-event" class="facebook-event" href="' + event.link + '" title="' + event.name + '">' + event.name + '</a>';
    e += '<p class="event-date">' + date.toLocaleDateString() + ' ' + date.toLocaleTimeString() + '</p>';
    if (event.location != undefined) {
        e += '<p class="event-location">' + event.location + '</p>';
    }
    e += '</li>';

    return e;
}

/**
 * Load the events from the configured stream and add them to the block.
 */
Drupal.behaviors.facebookEventsBlock = function() {
    if (Drupal.settings.facebookEventsBlock.stream == null) {
        return;
    }

    now = new Date();
    console.log('Timezone offset: ' + now.getTimezoneOffset());

    stream = 'https://graph.facebook.com/' + Drupal.settings.facebookEventsBlock.stream + '/events?callback=?';

    $.getJSON(stream, {
        since        : 'today',
        limit        : Drupal.settings.facebookEventsBlock.limit,
        access_token : Drupal.settings.facebook.accessToken,
        date_format  : 'U'
    }, function(data){
        if (data.error) {
            console.log(data.error.type + ': ' + data.error.message);
            return;
        }

        if (data.data.length == 0) {
            $('#facebook-events-placeholder').append(Drupal.t('No events found'));
            return;
        }
        // Remove placeholder from block
        e = $('#facebook-events-placeholder').parent();
        e.empty();
        e.append('<ul id="facebook-events-list" class="events-list"></ul>');

        data.data.reverse();

        /**
         * Event format:
         * {
         *   "name": "Laatste i.d-Kafee 2010/2011",
         *   "start_time": "2011-06-30T00:00:00+0000",
         *   "end_time": "2011-06-30T04:00:00+0000",
         *   "location": "i.d-Kafee",
         *   "id": "124138581005487"
         * },
         */
        $.each(data.data, function(index, event){
            $('#facebook-events-list').append(Drupal.theme('facebookEvent', event));
        });

        $('a.facebook-event').attr('target', '_blank');
    });
}
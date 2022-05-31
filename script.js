// Client ID and API key from the Developer Console
var CLIENT_ID = '462660603403-khj5nlahao22ed684s838h5a2k734uhf.apps.googleusercontent.com';
var API_KEY = 'AIzaSyBLsf9t5D6yVlzNi-fKb3SMZ-ZmC9EgBuw';

// Array of API discovery doc URLs for APIs used by the quickstart
var DISCOVERY_DOCS = [
	'https://www.googleapis.com/discovery/v1/apis/calendar/v3/rest',
	'https://content.googleapis.com/discovery/v1/apis/admin/directory_v1/rest'
];

// Authorization scopes required by the API; multiple scopes can be
// included, separated by spaces.
var SCOPES =
	'https://www.googleapis.com/auth/calendar.readonly https://www.googleapis.com/auth/admin.directory.resource.calendar.readonly';

var authorizeButton = document.getElementById('authorize_button');
var signoutButton = document.getElementById('signout_button');
var currentButton = document.getElementById('current_button');
var nextButton = document.getElementById('next_button');
var previousWeekButton = document.getElementById('previous_button');
var nextWeekButton = document.getElementById('advance_button');
var loadingNotification = document.getElementsByClassName('loading')[0];
var mainDiv = document.getElementsByClassName('main')[0];
let dateOffset = 0;
let dateOffsetFutureMax = 7;
let dateOffsetPastMax = -14;

/**
 *  On load, called to load the auth2 library and API client library.
 */
function handleClientLoad() {
	gapi.load('client:auth2', initClient);
}

/**
 *  Initializes the API client library and sets up sign-in state
 *  listeners.
 */
function initClient() {
	gapi.client
		.init({
			apiKey: API_KEY,
			clientId: CLIENT_ID,
			discoveryDocs: DISCOVERY_DOCS,
			scope: SCOPES
			// current_scope_granted = true;
		})
		.then(
			function() {
				// Listen for sign-in state changes.
				gapi.auth2.getAuthInstance().isSignedIn.listen(updateSigninStatus);

				// Handle the initial sign-in state.
				updateSigninStatus(gapi.auth2.getAuthInstance().isSignedIn.get());
				authorizeButton.onclick = handleAuthClick;
				signoutButton.onclick = handleSignoutClick;
				currentButton.onclick = handleCurrentButtonClick;
				nextButton.onclick = handleNextButtonClick;
				previousWeekButton.onclick = handlePreviousButtonClick;
				nextWeekButton.onclick = handleAdvanceButtonClick;
			},
			function(error) {
				console.log(JSON.stringify(error, null, 2));
			}
		);
}

/**
 *  Called when the signed in status changes, to update the UI
 *  appropriately. After a sign-in, the API is called.
 */
function updateSigninStatus(isSignedIn) {
	if (isSignedIn) {
		authorizeButton.classList.add('hidden');
		signoutButton.classList.remove('hidden');
		currentButton.classList.remove('hidden');
		nextButton.classList.remove('hidden');
		previousWeekButton.classList.remove('hidden');
		nextWeekButton.classList.remove('hidden');
		let target = new Date();
		target.setDate(target.getDate() + dateOffset);
		renderDesksWithEvents(target);
	} else {
		authorizeButton.classList.remove('hidden');
		signoutButton.classList.add('hidden');
		currentButton.classList.add('hidden');
		nextButton.classList.add('hidden');
		previousWeekButton.classList.add('hidden');
		nextWeekButton.classList.add('hidden');
	}
}

/**
 *  Sign in the user upon button click.
 */
function handleAuthClick(event) {
	gapi.auth2.getAuthInstance().signIn();
}

/**
 *  Sign out the user upon button click.
 */
function handleSignoutClick(event) {
	clearCalendar();
	gapi.auth2.getAuthInstance().signOut();
}

/**
*  Button handlers.
*/
function handleCurrentButtonClick(event) {
	clearCalendar();
	// mainDiv.classList.add("hidden");
	// loadingNotification.classList.remove("hidden");
	dateOffset = 0;
	showHideCalendarNav();
	let target = new Date();
	renderDesksWithEvents(target);
	// loadingNotification.classList.add("hidden");
	// mainDiv.classList.remove("hidden");
}

function handleNextButtonClick(event) {
	clearCalendar();
	// mainDiv.classList.add("hidden");
	// loadingNotification.classList.remove("hidden");
	dateOffset = 7;
	showHideCalendarNav();
	let target = new Date();
	target.setDate(target.getDate() + dateOffset);
	renderDesksWithEvents(target);
	// loadingNotification.classList.add("hidden");
	// mainDiv.classList.remove("hidden");
}

function handlePreviousButtonClick(event) {
	if (dateOffset > dateOffsetPastMax) {
		clearCalendar();
		dateOffset -= 7;
		showHideCalendarNav();
		let target = new Date();
		target.setDate(target.getDate() + dateOffset);
		renderDesksWithEvents(target);
	}
}

function handleAdvanceButtonClick(event) {
	if (dateOffset < dateOffsetFutureMax) {
		clearCalendar();
		dateOffset += 7;
		showHideCalendarNav();
		let target = new Date();
		target.setDate(target.getDate() + dateOffset);
		renderDesksWithEvents(target);
	}
}

function showHideCalendarNav() {
	if (dateOffset == dateOffsetPastMax) {
		//sort this bit out
		previousWeekButton.classList.add('hidden');
		if (dateOffset != dateOffsetFutureMax) {
			nextWeekButton.classList.remove('hidden');
		}
	} else if (dateOffset == dateOffsetFutureMax) {
		nextWeekButton.classList.add('hidden');
		if (dateOffset != dateOffsetPastMax) {
			previousWeekButton.classList.remove('hidden');
		}
	} else {
		previousWeekButton.classList.remove('hidden');
		nextWeekButton.classList.remove('hidden');
	}
}

/**
 * Clear down contents of calendar wrapper
 * @param {Clear } date 
 */
function clearCalendar() {
	document.getElementById('calendar_title').textContent = '';
	document.getElementsByClassName('calendar-results')[0].textContent = '';
}

/**
 * input optional date object, output array of first and last day of week for provided date.
* If not provided returns user's current week. 
* Week runs Sun - Sat
 *
 * @param {Date} [date] Optional seed date for calculation. Set to today if null.
 * @returns {Array.<Date>} Array containg start date of week and end date of week.
 */
function startAndEndOfWeekAsISOString(date) {
	//'2020-09-02T00:00:00Z'
	var curr = date ? date : new Date();
	//by default sets first/last day of week to sunday/saturday so don't need to worry about time portion as events will be mon - fri only
	var first = curr.getDate() - curr.getDay(); // First day is the  day of the month - the day of the week
	var last = first + 6; // last day is the first day + 6

	firstDay = new Date(curr.setDate(first));
	firstDay.setHours(0, 0, 0, 0);
	lastDay = new Date(curr.setDate(curr.getDate() + 6));
	lastDay.setHours(23, 59, 59, 0);

	console.log('start of week', firstDay.toISOString());
	console.log('end of week', lastDay.toISOString());
	return [ firstDay.toISOString(), lastDay.toISOString() ];
}

/**
 * Get a list of all calendar days between two dates, inclusive.
 * @param {Date} startDate First date of period. Inclusive.
 * @param {Date} [endDate] Final date of period. Inclusive.
 * @returns {Array.<Date>}
 */
function getDatesBetween(startDate, endDate) {
	if (!endDate) {
		dates = startAndEndOfWeekAsISOString(startDate);
		endDate = dates[1];
	}

	let dates = [];
	let date = new Date(startDate);
	let end = new Date(endDate);

	while (date <= end) {
		dates = [ ...dates, new Date(date) ];
		date.setDate(date.getDate() + 1);
	}
	return dates;
}

/**
 * Fetch a list of desks that match a preset pattern.
 * @returns {Promise<object[]>} Array of promises that represent desks available in the google calendar resources list
 */
function listDesks() {
	console.log('listDesks');

	// fetch list of desks api returns promise
	return gapi.client.directory.resources.calendars
		.list({
			customer: 'my_customer',
			orderBy: 'resourceName',
			query: '"generatedResourceName": "(Desk)-Brighton, UK-Desk*"'
		})
		.then(function(response) {
			console.log('resources.calendars.list Response', response);

			// extract response and iterate
			var assets = response.result.items;

			let assetCount = assets.length;
			if (assetCount > 0) {
				for (let i = 0; i < assetCount; i++) {
					let name = assets[i].resourceName;
					if (name.length < 7) {
						// assume no leading zero on desk number, add leading zero to aid sorting
						// console.log('name.length', name.length);
						// console.log('name.substring(0,5)', name.substring(0, 5));
						// console.log('name.substring(5, name.length)', name.substring(5, name.length));
						name = name.substring(0, 5) + ('0' + name.substring(5, name.length)).slice(-2);
						assets[i].resourceName = name;
					}
				}

				// sort assets(desks)
				assets = assets.sort((a, b) => {
					nameA = a.resourceName;
					nameB = b.resourceName;
					if (nameA < nameB) {
						return -1;
					}
					if (nameA > nameB) {
						return 1;
					}

					// names must be equal
					return 0;
				});
				console.log('alphabetically sorted assets array', assets);
			}

			return assets;
		});
}

/**
 * Main driver function.
 * 
 * @param {Date} targetDate Date on which to base the date range (Sun to Sat)
 */
function renderDesksWithEvents(targetDate) {
	console.log('renderDesksWithEvents');
	console.log('targetDate', targetDate.toISOString());

	// show loading icon
	loadingNotification.classList.remove('hidden');
	mainDiv.classList.add('hidden');

	let week = startAndEndOfWeekAsISOString(targetDate);

	// get desks
	let assets = [];
	assets = listDesks();
	assets.then((assets) => {
		console.log('desks', assets);

		let deskEvents = [];

		if (assets.length > 0) {
			// write dates of interest title
			let message = new Date(week[0]).toLocaleDateString() + ' - ' + new Date(week[1]).toLocaleDateString();
			let textContent = document.createTextNode(message);
			let el = document.createElement('h1');
			el.appendChild(textContent);
			var title = document.getElementById('calendar_title');
			title.appendChild(el);

			var cal = document.getElementsByClassName('calendar-results');

			for (i = 0; i < assets.length; i++) {
				// for each desk get events
				// 	add events promise to array
				var email = assets[i].resourceEmail;
				deskEvents.push(listUpcomingEvents(email, week[0], week[1]));
			}

			// Once all events have been returned, process array of events
			Promise.all(deskEvents).then((events) => {
				console.log('deskEvents', events);
				let calList = document.createElement('ul');
				calList.classList.add('calendar');
				cal[0].appendChild(calList);

				let weekDays = getDatesBetween(week[0], week[1]);
				// console.log("weekDays", weekDays.toString());
				console.log('weekDays', weekDays);
				numberOfDays = weekDays.length;
				console.log('numberOfDays', numberOfDays);

				// Insert calendar header
				let node = document.createElement('li');
				node.classList.add('grid-header');
				calList.appendChild(node);
				for (let i = 1; i < 6; i++) {
					let node = document.createElement('li');
					let textContent = document.createTextNode(weekDays[i].toLocaleDateString('en-GB'));
					node.appendChild(textContent);
					node.classList.add('grid-header');
					calList.appendChild(node);
				}

				// Render results
				// For each desk
				for (let i = 0; i < events.length; i++) {
					//appendPre(assets[i].resourceName + ' (' + assets[i].resourceEmail + ')');
					// appendPre(assets[i].resourceName);
					// write desk name
					let node = document.createElement('li');
					let textContent = document.createTextNode(assets[i].resourceName);
					node.appendChild(textContent);
					node.classList.add('grid-c-1');
					calList.appendChild(node);

					// console.log("Resource", assets[i].resourceName);
					console.groupCollapsed('Resource:', assets[i].resourceName, ', events:', events[i].length);
					console.log('event array', events[i]);

					if (events[i].length > 0) {
						// events exist

						// for each day in weekDays (excluding Sun and Sat)
						for (let k = 1; k < numberOfDays - 1; k++) {
							currentDateString = weekDays[k].toLocaleDateString('en-GB');
							// let message = ('    ' + currentDateString + '    ' + "No bookings");
							let message = '-';

							// for each event
							for (let j = 0; j < events[i].length; j++) {
								// get event start time
								var start = events[i][j].start.dateTime;
								if (!start) {
									start = events[i][j].start.date;
								}

								// get event end time. note end time of calendar bookings are "exclusive"
								// ie up to returned time but not including
								var end = events[i][j].end.dateTime;
								if (!end) {
									end = events[i][j].end.date + 'T00:00:00';
								}

								// convert utc timestamp to local time for user to reflect all day booking and set end time
								console.group('Starting date manipulation...');
								console.log('original start', start);
								console.log('original end', end);
								start = new Date(start);
								start.setHours(0, 0, 0, 0);
								end = new Date(end);
								// end.setHours(0, 0, 0, 0);
								end.setSeconds(-1);
								console.log('new start', start);
								console.log('new end', end);
								console.groupEnd();

								// check if event is active for current day k
								if (start <= weekDays[k] && end >= weekDays[k]) {
									// there is a booking
									// display date
									console.log('booking for weekday ', k);
									startDate = start.toLocaleDateString('en-GB');
									endDate = end.toLocaleDateString('en-GB');

									organizerEmail = events[i][j].organizer.email;
									organizerEmail = organizerEmail.substring(0, organizerEmail.length - 4);
									// message = ('    ' + currentDateString + '    ' + events[i][j].summary + ' (' + events[i][j].organizer.email + ')');
									// message = (events[i][j].summary + ' (' + events[i][j].organizer.email + ')');
									message = organizerEmail;
								} else {
									// skip to next event
									console.log('no booking for weekday', k);
								}
							}
							// write event details
							let node = document.createElement('li');
							let textContent = document.createTextNode(message);
							node.appendChild(textContent);
							calList.appendChild(node);
						}
					} else {
						// no events

						for (let k = 1; k < numberOfDays - 1; k++) {
							// currentDateString = weekDays[k].toLocaleDateString('en-GB');
							// let message = ('    ' + currentDateString + '    ' + "No bookings");
							let message = '-';
							// appendCalendar(message);
							let node = document.createElement('li');
							let textContent = document.createTextNode(message);
							node.appendChild(textContent);
							calList.appendChild(node);
						}
					}
					console.groupEnd();
				}
			});
		} else {
			// no desks
			let node = document.createElement('p');
			let textContent = document.createTextNode('No desks found.');
			node.appendChild(textContent);
			calList.appendChild(node);
		}

		// reset display
		loadingNotification.classList.add('hidden');
		mainDiv.classList.remove('hidden');
	});

	assets.catch((err) => {
		console.error('listDesks', 'There was an error processing the desks. ' + err);
	});
}

/**
 * Fetch the events related to the provided calendar. 
 * Returns array of promises containing event objects
 * 
 * @param {?string} calendarId Email address of calendar or null. 
 * @param {String} minTime Earliest start time of events.
 * @param {String} maxTime Latest end time of events.
 * @returns {Promise<object[]>}
 */
function listUpcomingEvents(calendarId, minTime, maxTime) {
	console.log('listUpcomingEvents');
	var calendar = calendarId
		? calendarId
		: 'c_1882pspe8q81ei2oku0d5hmqs1hjg4gad5n76q3le8n66rrd@resource.calendar.google.com';
	//week = startAndEndOfWeekAsISOString('2020-09-23T00:00:00Z');
	//week = startAndEndOfWeekAsISOString();
	return gapi.client.calendar.events
		.list({
			calendarId: calendar,
			orderBy: 'startTime',
			singleEvents: true,
			timeMax: maxTime, // this is not the latest start time it's the latest end time
			timeMin: minTime
		})
		.then(function(response) {
			//console.log("Event Response", response);
			var events = response.result.items;

			return events;
		});
}

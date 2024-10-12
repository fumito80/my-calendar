import {
  EventType, Event, draw, getStartDate, truncToDate, $,
} from './view';

const SCRIPTS = [
  'https://apis.google.com/js/api.js',
  'https://accounts.google.com/gsi/client',
];

// Discovery doc URL for APIs used by the quickstart
const DISCOVERY_DOCS = [
  'https://www.googleapis.com/discovery/v1/apis/calendar/v3/rest',
];

// Authorization scopes required by the API; multiple scopes can be
// included, separated by spaces.
const SCOPES = [
  'https://www.googleapis.com/auth/calendar.readonly',
];

// const KEY_ACCESS_TOKEN = 'accessToken';

const EVENT_TYPE: { [key: string]: EventType['type'] } = {
  21: 'event',
  12: 'anniversary',
  15: 'owner',
};

type PromiseType<T> = T extends (...a: any) => Promise<infer S> ? NonNullable<S> : never;

async function listEvents(item: { id: string, eventType: EventType['type'] }) {
  const response = await gapi.client.calendar.events.list({
    calendarId: item.id,
    timeMin: getStartDate().toISOString(),
    showDeleted: false,
    singleEvents: true,
    maxResults: 30,
    orderBy: 'startTime',
  });
  return response.result.items.map((event) => ({
    eventType: (event.description === '祝日' && item.eventType === 'event') ? 'holiday' : item.eventType,
    dateNum: truncToDate(new Date(event.start.date!)),
    summary: event.summary,
  }));
}

async function listCalendar() {
  const { result } = await gapi.client.calendar.calendarList.list();
  return result.items.map(({ id, colorId }) => ({
    id, eventType: EVENT_TYPE[colorId!],
  }));
}

type Calendars = PromiseType<typeof listCalendar>;

async function addEvents([item, ...items]: Calendars, events: Event[] = []) {
  if (!item) {
    return events;
  }
  const newEvents = await listEvents(item);
  return addEvents(items, [...events, ...newEvents]);
}

function getConfig() {
  const apiKey = $<HTMLInputElement>('api-key')?.value;
  const clientId = $<HTMLInputElement>('client-id')?.value;
  if (!apiKey || !clientId) {
    return Promise.reject();
  }
  return Promise.resolve({ apiKey, clientId });
}

type GetConfigReturnType = PromiseType<typeof getConfig>;

async function initializeGapiClient(config: GetConfigReturnType) {
  return gapi.client.init({
    apiKey: config.apiKey,
    discoveryDocs: DISCOVERY_DOCS,
  });
  // gapiInited = true;
  // maybeEnableButtons();
}

function checkAuth(
  config: GetConfigReturnType,
  resolve: Function,
  reject: (reason?: any) => void,
) {
  return ({ error }: google.accounts.oauth2.TokenResponse) => {
    if (error !== undefined) {
      reject(error);
    }
    // sessionStorage.setItem(KEY_ACCESS_TOKEN, access_token);
    localStorage.setItem('apiKey', config.apiKey);
    localStorage.setItem('clientId', config.clientId);
    resolve(config);
  };
}

function loadGis(authed: boolean) {
  return async (config: GetConfigReturnType) => {
    if (authed) {
      return config;
    }
    return new Promise<PromiseType<typeof getConfig>>((resolve, reject) => {
      const tokenClient = google.accounts.oauth2.initTokenClient({
        scope: SCOPES.join(' '),
        client_id: config.clientId,
        callback: checkAuth(config, resolve, reject),
      });
      tokenClient.requestAccessToken({ prompt: '' });
    });
  };
}

// async function getAccessToken(config: GetConfigReturnType) {
//   const accessToken = gapi.client.getToken();
//   // const accessToken = sessionStorage.getItem('accessToken');
//   if (accessToken) {
//     // enableSearch();
//     // return accessToken;
//     return config;
//   }
//   return loadGis(config);
// }

async function loadGapiClient() {
  return new Promise<void>((resolve) => {
    gapi.load('client', resolve);
  });
}

async function checkToken(accessToken: string) {
  const auth = await fetch(`https://oauth2.googleapis.com/tokeninfo?access_token=${accessToken}`)
    .then((resp) => resp.json());
  return !!auth.azp;
}

async function loadScripts(uris: string[]) {
  const accessToken = (typeof gapi !== 'undefined') ? gapi.client?.getToken() : undefined;
  if (accessToken) {
    if (await checkToken(accessToken.access_token)) {
      return listCalendar()
        .then(addEvents)
        .then(draw)
        // eslint-disable-next-line no-console
        .catch(console.error);
    }
  }
  const scripts = uris.map((uri) => new Promise((resolve) => {
    const $script = document.head.appendChild(document.createElement('script'));
    $script.src = uri;
    $script.addEventListener('load', resolve);
  }));
  // const savedAccessToken = sessionStorage.getItem('accessToken');
  // const authed = !!savedAccessToken && await checkToken(savedAccessToken);
  const authed = false;
  return Promise.all(scripts)
    .then(loadGapiClient)
    .then(getConfig)
    .then(loadGis(authed))
    .then(initializeGapiClient)
    .then(listCalendar)
    .then(addEvents)
    .then(draw)
    // eslint-disable-next-line no-console
    .catch(console.error);
}

// authorized().then(initializeMap);
// loadScripts(SCRIPTS);

$<HTMLInputElement>('api-key').value = localStorage.getItem('apiKey') || '';
$<HTMLInputElement>('client-id').value = localStorage.getItem('clientId') || '';

loadScripts(SCRIPTS);

$<HTMLFormElement>('form-config')?.addEventListener('submit', (e) => {
  loadScripts(SCRIPTS);
  e.preventDefault();
});

$<HTMLFormElement>('config')?.addEventListener('click', () => {
  const $formConfig = $<HTMLInputElement>('form-config');
  const hidden = getComputedStyle($formConfig).maxHeight === '0px';
  $formConfig.style.maxHeight = hidden ? '100vh' : '0';
});

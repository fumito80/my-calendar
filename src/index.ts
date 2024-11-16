import {
  today, DAYS, EventType, Event, draw, getStartDate, $,
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

type AnyFunction = (...a: any) => any;
type PromiseFunction = (...a: any) => Promise<any>;

type FunctionReturn<T> = T extends PromiseFunction
  ? Awaited<ReturnType<T>>
  : T extends AnyFunction ? ReturnType<T> : never;

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
    dateNum: Number(new Date(event.start.date!.replaceAll('-', '/'))),
    summary: event.summary,
  }));
}

async function listCalendar() {
  const { result } = await gapi.client.calendar.calendarList.list();
  return result.items.map(({ id, colorId }) => ({
    id, eventType: EVENT_TYPE[colorId!],
  }));
}

type Calendars = FunctionReturn<typeof listCalendar>;

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

type GetConfigReturnType = FunctionReturn<typeof getConfig>;

async function initializeGapiClient({ apiKey }: GetConfigReturnType) {
  return gapi.client.init({
    apiKey,
    discoveryDocs: DISCOVERY_DOCS,
  });
  // gapiInited = true;
  // maybeEnableButtons();
}

function checkAuth(
  config: GetConfigReturnType,
  resolve: Function,
  reject: Function,
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

function loadGis(config: GetConfigReturnType, authed: boolean) {
  return () => {
    if (authed) {
      return config;
    }
    return new Promise<FunctionReturn<typeof getConfig>>((resolve, reject) => {
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

async function loadScripts() {
  const scripts = SCRIPTS.map((uri) => new Promise<void>((resolve) => {
    const $script = document.head.appendChild(document.createElement('script'));
    $script.src = uri;
    $script.addEventListener('load', () => resolve());
  }));
  return Promise.all(scripts);
}

function isEvents(arg: any): arg is Event[] {
  if (!Array.isArray(arg)) {
    return false;
  }
  return typeof arg[0]?.dateNum === 'number' && typeof arg[0]?.summary === 'string' && typeof arg[0]?.eventType === 'string';
}

function getEventsLocal({ apiKey }: GetConfigReturnType) {
  const storage = localStorage.getItem(apiKey);
  if (storage) {
    const events = JSON.parse(storage);
    if (isEvents(events)) {
      return events;
    }
  }
  return undefined;
}

function setEventsLocal({ apiKey }: GetConfigReturnType) {
  return (events: Event[]) => {
    localStorage.setItem(apiKey, JSON.stringify(events));
  };
}

async function run(reload = false) {
  const config = await getConfig().catch(() => undefined);
  if (!config) {
    return undefined;
  }
  const events = getEventsLocal(config);
  if (!reload && events) {
    return draw(events);
  }
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
  // const savedAccessToken = sessionStorage.getItem('accessToken');
  // const authed = !!savedAccessToken && await checkToken(savedAccessToken);
  const authed = false;
  return loadScripts()
    .then(loadGapiClient)
    .then(loadGis(config, authed))
    .then(initializeGapiClient)
    .then(listCalendar)
    .then(addEvents)
    .then(draw)
    .then(setEventsLocal(config))
    // eslint-disable-next-line no-console
    .catch(console.error);
}

// authorized().then(initializeMap);
// loadScripts(SCRIPTS);

const date = today
  .toLocaleDateString()
  .replace('/', `年（令和${today.getFullYear() - 2018}年）`)
  .replace('/', '月')
  .concat(`日 ${DAYS[(today.getDay() + 1) % 7]}曜日`);

$<HTMLDivElement>('date').prepend(document.createTextNode(date));

$<HTMLInputElement>('api-key').value = localStorage.getItem('apiKey') || '';
$<HTMLInputElement>('client-id').value = localStorage.getItem('clientId') || '';

$<HTMLButtonElement>('clear-pwa-cache').addEventListener('click', () => {
  navigator.serviceWorker.getRegistration()
    .then((registration) => registration?.unregister())
    .then(() => window.location.reload());
});

$<HTMLFormElement>('form-config')?.addEventListener('submit', (e) => {
  run(true);
  e.preventDefault();
});

$<HTMLFormElement>('config')?.addEventListener('click', () => {
  const $main = $<HTMLElement>('main');
  const method = $main.classList.contains('hide-config') ? 'remove' : 'add';
  $main.classList[method]('hide-config');
});

$<HTMLFormElement>('refresh')?.addEventListener('click', () => {
  run(true);
});

run();

// for PWA
if ('serviceWorker' in navigator) {
  navigator.serviceWorker.register('sw.js')
    .then((registration) => {
      console.info('ServiceWorker registration successful with scope: ', registration.scope);
      registration.addEventListener('updatefound', () => {
        registration.update();
        console.info('PWA Registration update.');
      });
    })
    .catch((err) => console.info('ServiceWorker registration failed: ', err));
}

const oneDayNum = 1000 * 60 * 60 * 24;
const GMT = 54000000;

export const DAYS = ['土', '日', '月', '火', '水', '木', '金'];

export function $<T>(selector: string) {
  return document.getElementsByClassName(selector)[0] as T;
}

export type EventType = { summay: string, type: 'holiday' | 'anniversary' | 'owner' | 'event' };
export type Event = { dateNum: number, eventType: EventType['type'], summary: string };

type TDate = { date: Date, events: Event[] };
type ReduceResult = { myEvents: Event[], dates: TDate[] };

function truncToDate(date: Date | number = new Date()) {
  return new Date(Math.trunc((Number(date) - GMT) / oneDayNum) * oneDayNum + GMT);
}

export const today = truncToDate();

export function getStartDate() {
  const day1 = (new Date((new Date(today)).setDate(1)));
  return new Date(Number(day1) - (((day1.getDay() + 1) % 7) + 7) * oneDayNum);
}

function makeGrid({ date, events }: TDate, index: number) {
  const title = (!index || date.getDate() === 1)
    ? date.toLocaleDateString().substring(5)
    : date.getDate();
  const $grid = Object.assign(document.createElement('div'), { title });
  if (Number(date) === Number(today)) {
    $grid.classList.add('today');
  }
  if (index % 7 < 2) {
    $grid.classList.add('holiday');
  }
  const monthes = date.getMonth() - today.getMonth();
  $grid.classList.add(`month-${monthes}`);
  $grid.append(...events.map(({ summary, eventType }) => Object.assign(document.createElement('div'), { title: summary, className: eventType })));
  return $grid;
}

function getDaysEl() {
  return DAYS.map((title) => Object.assign(document.createElement('div'), { title }));
}

function getEvents(myEvents: Event[], dateNum: number) {
  const events = [];
  for (let i = 0; i < myEvents.length; i += 1) {
    if (myEvents[i].dateNum === dateNum) {
      events.push(myEvents[i]);
    } else if (myEvents[i].dateNum > dateNum) {
      break;
    }
  }
  const eventsRemain = myEvents.slice(events.length);
  return [events, eventsRemain];
}

export function draw(myEvents: Event[]) {
  const sorted = myEvents.sort((a, b) => a.dateNum - b.dateNum);
  const $grid = $<HTMLDivElement>('grid')!;
  $grid.innerHTML = '';
  const startDateNum = Number(getStartDate());
  const { dates } = [...Array(105)].reduce<ReduceResult>((acc, _, i) => {
    const date = new Date(startDateNum + oneDayNum * i);
    const [events, eventsRemain] = getEvents(acc.myEvents, Number(date));
    return { myEvents: eventsRemain, dates: [...acc.dates, { date, events }] };
  }, { myEvents: sorted, dates: [] });
  $grid.append(...getDaysEl(), ...dates.map(makeGrid));
  return myEvents;
}

const oneDayNum = 1000 * 60 * 60 * 24;

export function $<T>(selector: string) {
  return document.querySelector(selector) as T;
}

export type EventType = { summay: string, type: 'holiday' | 'anniversary' | 'owner' | 'event' };
export type Event = { dateNum: number, eventType: EventType['type'], summary: string };

type TDate = { date: Date, events: Event[] };
type ReduceResult = { myEvents: Event[], dates: TDate[] };

export function truncToDate(date: Date | number) {
  return Math.trunc((Number(date) - 54000000) / 86400000) * 86400000 + 54000000;
}

export function getStartDate() {
  const day1 = (new Date(truncToDate((new Date()).setDate(1))));
  return new Date(Number(day1) - ((day1.getDay() + 6) % 7) * oneDayNum);
}

function makeGrid(today: number) {
  return ({ date, events }: TDate) => {
    const title = date.getDate() === 1 ? date.toLocaleDateString().substring(5) : date.getDate();
    const $grid = Object.assign(document.createElement('div'), { title });
    if (Number(date) === today) {
      $grid.classList.add('today');
    }
    $grid.append(...events.map(({ summary, eventType }) => Object.assign(document.createElement('div'), { title: summary, className: eventType })));
    return $grid;
  };
}

function getDaysEl() {
  return ['月', '火', '水', '木', '金', '土', '日'].map((title) => Object.assign(document.createElement('div'), { title }));
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
  return events;
}

export function draw(myEvents: Event[]) {
  const sorted = myEvents.sort((a, b) => a.dateNum - b.dateNum);
  const $grid = $<HTMLDivElement>('.grid')!;
  $grid.innerHTML = '';
  const startDateNum = Number(getStartDate());
  const { dates } = [...Array(91)].reduce<ReduceResult>((acc, _, i) => {
    const date = new Date(startDateNum + oneDayNum * i);
    const events = getEvents(acc.myEvents, Number(date));
    const eventsRemain = acc.myEvents.slice(events.length);
    return { myEvents: eventsRemain, dates: [...acc.dates, { date, events }] };
  }, { myEvents: sorted, dates: [] });
  $grid.append(...getDaysEl(), ...dates.map(makeGrid(truncToDate(Date.now()))));
}

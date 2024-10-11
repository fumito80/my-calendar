const oneDayNum = 1000 * 60 * 60 * 24;

export function $<T>(selector: string) {
  return document.querySelector(selector) as T;
}

export type EventType = { type: 'holiday' | 'anniversary' | 'owner' | 'event', summay: string };
export type Event = { dateStr: string, eventType: EventType['type'], summary: string };

type TDate = { date: Date, events: Event[] };
type ReduceResult = { myEvents: Event[], dates: TDate[] };

function truncToDate(date: Date | number) {
  return Math.trunc(Number(date) / 86400000) * 86400000 + 54000000;
}

export function getStartDate() {
  const day1 = (new Date(truncToDate((new Date()).setDate(1))));
  return new Date(Number(day1) - ((day1.getDay() + 6) % 7) * oneDayNum);
}

function makeGrid(today: number) {
  return ({ date, events }: TDate) => {
    const $grid = Object.assign(document.createElement('div'), {
      'data-date': date.toLocaleDateString(),
      title: date.getDate() === 1 ? date.toLocaleDateString() : date.getDate(),
    });
    if (Number(date) === today) {
      $grid.classList.add('today');
    }
    $grid.append(...events.map(({ summary, eventType }) => Object.assign(document.createElement('div'), { title: summary, className: eventType })));
    return $grid;
  };
}

function getDaysEl() {
  return ['月', '火', '水', '木', '金', '土', '日'].map((day) => {
    const div = document.createElement('div');
    div.textContent = day;
    return div;
  });
}

export function draw(myEvents: Event[]) {
  const sorted = myEvents.sort((a, b) => Number(new Date(a.dateStr)) - Number(new Date(b.dateStr)));
  const $grid = $<HTMLDivElement>('.grid')!;
  $grid.innerHTML = '';
  const startDateNum = Number(getStartDate());
  const { dates } = [...Array(91)].reduce<ReduceResult>((acc, _, i) => {
    const date = new Date(startDateNum + oneDayNum * i);
    const events = acc.myEvents.filter((event) => date.toLocaleDateString().replaceAll('/', '-') === event.dateStr);
    const eventsRemain = acc.myEvents.slice(events.length);
    return { myEvents: eventsRemain, dates: [...acc.dates, { date, events }] };
  }, { myEvents: sorted, dates: [] });
  $grid.append(...getDaysEl(), ...dates.map(makeGrid(truncToDate(Date.now()))));
}

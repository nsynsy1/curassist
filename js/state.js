const COMPLAINT_SECTIONS = [
  'Жалобы на игроков, состоящих в государственных организациях',
  'Жалобы на мафии',
  'Жалобы на игроков, не состоящих в организациях',
  'Жалобы на проведение семейных мероприятий',
  'Жалобы на обман игроков',
  'Жалобы на слёты имущества (опровержения)'
];

const ORGANIZATION_VERDICTS = [
  'Организация функционирует отлично',
  'Организация функционирует хорошо',
  'Организация функционирует удовлетворительно',
  'Организация функционирует неудовлетворительно',
  'Организация функционирует плохо',
  'Организация не функционирует'
];

const EVENT_ACTIVITIES = ['Нет', 'Низкая', 'Небольшая', 'Средняя', 'Высокая'];

const EVENT_TYPES = [
  { value: 'airdrop', name: 'AirDrop' },
  { value: 'port',    name: 'Порт' },
  { value: 'ship',    name: 'Корабль' }
];

const TASK_STATUS_OPTIONS = ['Выполнено', 'Частичное выполнение', 'Не выполнено'];

const WEEK_DAYS = ['Понедельник', 'Вторник', 'Среда', 'Четверг',
  'Пятница', 'Суббота', 'Воскресенье'];

const SECTIONS = [
  { id: 'governmentOrgsCheck',   number: '7.1',  title: 'Проверка государственных организаций' },
  { id: 'illegalEventsObservation', number: '7.2', title: 'Наблюдение за мероприятиями нелегальных структур' },
  { id: 'complaintsReview',      number: '7.3',  title: 'Проверка разделов жалоб на форуме' },
  { id: 'callsConduct',          number: '7.4',  title: 'Проведение обзвонов' },
  { id: 'adminsWorkControl',     number: '7.5',  title: 'Контроль работы администраторов' },
  { id: 'communicationRecords',  number: '7.6',  title: 'Общение с лидерами, игроками и администраторами' },
  { id: 'mappingCheck',          number: '7.7',  title: 'Проверка маппинга' },
  { id: 'topHousesLogs',         number: '7.8',  title: 'Проверка логов владельцев топовых домов' },
  { id: 'adminsLogsCheck',       number: '7.9',  title: 'Проверка логов администраторов на нарушения регламента' },
  { id: 'apartmentsLogsCheck',   number: '7.10', title: 'Проверка логов владельцев квартир в ЖК' },
  { id: 'teamTask1',             number: null,   title: 'Командное задание №1' },
  { id: 'teamTask2',             number: null,   title: 'Командное задание №2' },
  { id: 'teamTask3',             number: null,   title: 'Командное задание №3' },
  { id: 'weeklyStreams',         number: null,   title: 'Стримы за неделю', noChecklist: true }
];

function createDefaultState() {
  const { start, end } = getCurrentWeek();
  return {
    meta: {
      weekStart: start,
      weekEnd: end,
      checklist: {
        governmentOrgsCheck: false,
        illegalEventsObservation: false,
        complaintsReview: false,
        callsConduct: false,
        adminsWorkControl: false,
        communicationRecords: false,
        mappingCheck: false,
        topHousesLogs: false,
        adminsLogsCheck: false,
        apartmentsLogsCheck: false,
        teamTask1: false,
        teamTask2: false,
        teamTask3: false
      },
      lastSaved: null
    },
    governmentOrgsCheck: { checks: [], leadersTalks: [], failReason: '' },
    illegalEventsObservation: { events: [], conclusion: '', failReason: '' },
    complaintsReview: {
      date: '', videoLink: '', timecode: '',
      badAnswers: [], overdue: [],
      conclusion: '', failReason: ''
    },
    callsConduct: { calls: [], failReason: '' },
    adminsWorkControl: { tasks: [], conclusion: '', failReason: '' },
    communicationRecords: { records: [], failReason: '' },
    mappingCheck: { checks: [], delegation: '', conclusion: '', failReason: '' },
    topHousesLogs: { checks: [], conclusion: '', failReason: '' },
    adminsLogsCheck: {
      date: '', description: '', videoLink: '', timecode: '',
      details: '', tableLink: '', conclusion: '', failReason: ''
    },
    apartmentsLogsCheck: { checks: [], conclusion: '', failReason: '' },
    teamTasks: [
      { id: 'teamTask1', number: 1, records: [], conclusion: '' },
      { id: 'teamTask2', number: 2, records: [], conclusion: '' },
      { id: 'teamTask3', number: 3, records: [], conclusion: '' }
    ],
    weeklyStreams: []
  };
}
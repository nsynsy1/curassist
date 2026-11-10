// Реестр рендереров разделов. Подключается последним.

const SECTION_RENDERERS = {
  governmentOrgsCheck:     renderGovernmentOrgsCheck,
  illegalEventsObservation: renderIllegalEventsObservation,
  complaintsReview:        renderComplaintsReview,
  callsConduct:            renderCallsConduct,
  adminsWorkControl:       renderAdminsWorkControl,
  communicationRecords:    renderCommunicationRecords,
  mappingCheck:            renderMappingCheck,
  topHousesLogs:           renderTopHousesLogs,
  adminsLogsCheck:         renderAdminsLogsCheck,
  apartmentsLogsCheck:     renderApartmentsLogsCheck,
  teamTask1:               () => renderTeamTask(0),
  teamTask2:               () => renderTeamTask(1),
  teamTask3:               () => renderTeamTask(2),
  weeklyStreams:           renderWeeklyStreams
};

function renderSectionBody(sectionId) {
  const fn = SECTION_RENDERERS[sectionId];
  if (!fn) {
    console.warn(`[renderSectionBody] Рендер для секции «${sectionId}» не найден.`);
    return '';
  }
  return fn();
}

export const generateGoogleCalendarUrl = (params: {
  title: string;
  details: string;
  location?: string;
  startTime: string | number;
  durationMinutes?: number;
}) => {
  const { title, details, location = '', startTime, durationMinutes = 60 } = params;
  
  const start = new Date(startTime);
  const end = new Date(start.getTime() + durationMinutes * 60000);

  const formatDate = (date: Date) => {
    return date.toISOString().replace(/-|:|\.\d\d\d/g, "");
  };

  const baseUrl = 'https://calendar.google.com/calendar/render?action=TEMPLATE';
  const encodedTitle = encodeURIComponent(title);
  const encodedDetails = encodeURIComponent(details);
  const encodedLocation = encodeURIComponent(location);
  const dates = `${formatDate(start)}/${formatDate(end)}`;

  return `${baseUrl}&text=${encodedTitle}&details=${encodedDetails}&location=${encodedLocation}&dates=${dates}`;
};

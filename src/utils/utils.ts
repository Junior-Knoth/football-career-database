export function isValidDate(dateString: string): boolean {
  const date = new Date(dateString);
  return !isNaN(date.getTime());
}

export function getAge(birthdate: string, currentDate: string): number {
  if (!isValidDate(birthdate) || !isValidDate(currentDate)) {
    throw new Error("Invalid date format. Please use 'YYYY-MM-DD'.");
  }

  const birth = new Date(birthdate);
  const current = new Date(currentDate);

  let age = current.getFullYear() - birth.getFullYear();
  const monthDiff = current.getMonth() - birth.getMonth();
  if (
    monthDiff < 0 ||
    (monthDiff === 0 && current.getDate() < birth.getDate())
  ) {
    age--;
  }
  return age;
}

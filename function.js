/**
 * @description 시간 지연 함수
 * @param {number} ms
 */
export const sleep = async (ms) => {
  return new Promise((resolve, reject) => setTimeout(() => resolve(), ms));
};

/**
 * Used to load resources
 */
export class ResourceLoader {
  /**
   * Load a remote resource and get the response as a string
   * @param path
   * @returns
   */
  async loadFile(path: string): Promise<string> {
    return new Promise((resolve, reject) => {
      const xhttp = new XMLHttpRequest();
      xhttp.onreadystatechange = (e) => {
        if (xhttp.readyState == 4 && xhttp.status == 200) {
          resolve(xhttp.responseText);
        } else if (
          xhttp.readyState == 4 &&
          xhttp.status > 400 &&
          xhttp.status < 600
        ) {
          console.error('error response (' + xhttp + '): ' + path);
          reject(e);
        }
      };
      xhttp.onerror = (e) => {
        reject(e);
      };
      xhttp.open('GET', path, true);
      xhttp.send();
    });
  }
}

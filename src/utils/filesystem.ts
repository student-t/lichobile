export function getFiles(prefix: string): Promise<FileEntry[]> {
  return new Promise((resolve, reject) => {
    window.requestFileSystem(LocalFileSystem.PERSISTENT, 0, (fs) => {
      fs.root.createReader().readEntries((entries: FileEntry[]) => {
        resolve(entries.filter(e => e.isFile && e.name.includes(prefix)))
      }, reject)
    }, reject)
  })
}

export function getLocalFileOrDowload(remoteFileUri: string, fileName: string, prefix: string, onProgress?: (e: ProgressEvent) => void): Promise<FileEntry> {
  return new Promise((resolve, reject) => {
    window.requestFileSystem(LocalFileSystem.PERSISTENT, 0, (fs) => {
      fs.root.getFile(prefix + fileName, undefined, (fe) => {
        fe.file(f => {
          if (f.size > 0) {
            resolve(fe)
          } else {
            syncRemoteFile(fs, remoteFileUri, fileName, prefix, onProgress)
            .then(resolve)
            .catch(reject)
          }
        }, reject)
      }, (err: FileError) => {
        if (err.code === FileError.NOT_FOUND_ERR) {
          syncRemoteFile(fs, remoteFileUri, fileName, prefix, onProgress)
          .then(resolve)
          .catch(reject)
        } else {
          reject(err)
        }
      })
    }, reject)
  })
}

function syncRemoteFile(fs: FileSystem, remoteFileUri: string, fileName: string, prefix: string, onProgress?: (e: ProgressEvent) => void): Promise<FileEntry> {
  return new Promise((resolve, reject) => {
    fs.root.getFile(
      prefix + fileName,
      { create: true, exclusive: false },
      (fileEntry) =>
        download(fileEntry, remoteFileUri, onProgress)
        .then(resolve)
        .catch(err => {
          // a zero lenght file is created while trying to download and save
          fileEntry.remove(() => {})
          reject(err)
        }),
      reject
    )
  })
}

function download(fileEntry: FileEntry, remoteURI: string, onProgress?: (e: ProgressEvent) => void): Promise<FileEntry> {
  return new Promise((resolve, reject) => {
    const client = new XMLHttpRequest()
    client.open('GET', remoteURI, true)
      client.responseType = 'blob'
      if (onProgress) {
        client.onprogress = onProgress
      }
      client.onload = () => {
        const blob = client.response
        if (blob) {
          fileEntry.createWriter(fileWriter => {
            fileWriter.onwriteend = () => resolve(fileEntry)
            fileWriter.onerror = reject
            fileWriter.write(blob)
          }, reject)
        } else {
          reject('could not get file')
        }
      }
      client.send()
  })
}

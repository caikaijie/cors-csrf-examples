import express from 'express'
import cookieParser from 'cookie-parser'
import bodyParser from 'body-parser'
import busboy from 'connect-busboy'
import http from 'http'
import sio from 'socket.io'

const app = express()
const server = http.Server(app)
const io = sio(server)
const port = 3001
const host = '127.0.0.1'

function info(msg) {
  io.emit('serverinfo', msg)
}

io.on('connection', function () {
  info('Server Console is connected.')
})

///
function reqInfo(req) {
  const cookies = {
    sessionid: req.cookies.sessionid,
    csrftoken: req.cookies.csrftoken
  }
  return `${req.method} "${req.originalUrl}" with Cookies: ${JSON.stringify(cookies)}`
}

function reqInfoWithHeaders(req) {
  const headers = {
    origin: req.headers.origin,
    referer: req.headers.referer,
    accept: req.headers.accept,
    'accept-encoding': req.headers['accept-encoding'],
    'accept-language': req.headers['accept-language'],
    'x-xxx-header': req.headers['x-xxx-header'],
    'access-control-request-headers': req.headers['access-control-request-headers'],
    'access-control-request-method': req.headers['access-control-request-method'] 
  }
  return `${reqInfo(req)} and Headers: ${JSON.stringify(headers)}`
}

// https://fetch.spec.whatwg.org/#http-requests
function isCrossOriginRequest(req) {
  return !!req.headers.origin
}

function setHeader(res, k, v, msg = '') {
  info(`set response header ${k} : ${v}. ${msg}`)
  res.setHeader(k, v)
}

// Use https://github.com/expressjs/cors instead in production.
function cors(withCredentials = false) {
  return function corsMiddleware(req, res, next) {
    const method = req.method && req.method.toUpperCase && req.method.toUpperCase()

    if (method === 'OPTIONS') {
      // preflight
      info('IN PREFLIGHT(OPTIONS method)')
      info(`${reqInfoWithHeaders(req)} - in CORS middleware.`)    
      setHeader(
        res, 
        'Access-Control-Allow-Origin', 
        withCredentials ? req.headers.origin : '*',
        withCredentials ? 'when responding to a credentialed request,  server must specify a domain, and cannot use wild carding.' : '')
      withCredentials ? setHeader(res, 'Access-Control-Allow-Credentials', 'true') : void 0
      setHeader(res, 'Access-Control-Allow-Methods', 'GET,POST,DELETE,PUT')
      setHeader(res, 'Access-Control-Allow-Headers', req.headers['access-control-request-headers'] || '')
      setHeader(res, 'Access-Control-Max-Age', '1', 'The preflight request can be cached without sending another preflight request for 1s')
      setHeader(res, 'Access-Control-Expose-Headers', 'X-XXX-HEADER', 'Whitelist headers that browsers are allowed to access')
      res.sendStatus(204)
    } else {
      // actual response
      info('IN ACTUAL RESPONSE')
      setHeader(
        res, 
        'Access-Control-Allow-Origin', 
        withCredentials ? req.headers.origin : '*',
        withCredentials ? 'when responding to a credentialed request,  server must specify a domain, and cannot use wild carding.' : '')
      withCredentials ? setHeader(res, 'Access-Control-Allow-Credentials', 'true') : void 0
      setHeader(res, 'Access-Control-Expose-Headers', 'X-XXX-HEADER', 'Whitelist headers that browsers are allowed to access')
      next()      
    }
  }
}

///

app.use(function (req, res, next) {
  // Cookies are not port specific, use different host name. 
  if (req.hostname !== host) {
    res.sendStatus(404)
    return
  }
  next()
})
app.use(cookieParser())
app.use(bodyParser())
app.use(busboy())

/// embedding
app.use('/static', express.static('./server/static'))

const privateApi = express.Router()

privateApi.get('/link-action', function (req, res) {
  info(`${reqInfo(req)} - MUST NOT do unsafe actions here.`)
  res.send('Origin-Site cannot read this message.')
})

privateApi.all('/form-action', function (req, res) {
  info(`${reqInfo(req)} - Doing form action with params(${JSON.stringify(req.body)}). Can be ATTACKED by CSRF.`)
  res.send('Origin-Site cannot read this form submission response.')  
})

app.use('/private-api', privateApi)

app.route('/private/resource')
  .get(function (req, res) {
    info(`${reqInfoWithHeaders(req)} - GET action is triggered.`)
    if (isCrossOriginRequest(req)) {
      info('This is a Cross-Origin request. Simply return 403.')
      res.sendStatus(403)
      return
    }
    res.send('private get')
  })
  .post(function (req, res) {
    info(`${reqInfoWithHeaders(req)} - POST action is triggered.(this is a simple post)`)
    if (req.busboy) {
      req.busboy.on('file', function (fieldname, file, filename) {
        info(`file ready: ${fieldname} - ${filename}`)
      })
      req.busboy.on('field', function (key, value) {
        info(`field ready: ${key} - ${value}`)
      })
      req.pipe(req.busboy)
    } else {
      info(`body ready: ${JSON.stringify(req.body)}`)
    }
    const csrftoken = req.headers['x-csrf-token']
    const csrftokenInSession = req.cookies['csrftoken']
    console.log(csrftoken, csrftokenInSession)
    if ( csrftoken && csrftoken === csrftokenInSession ) {
      res.send('private post')    
    } else {
      info('invalid csrftoken detected.')
      res.status = 403
      res.send('invalid csrftoken.')
    }
  })
  .delete(function (req, res) {
    info(`${reqInfoWithHeaders(req)} - DELETE action can not be triggered.(You MUST NOT see this message)`)
    res.send('private delete')    
  })
  .put(function (req, res) {
    info(`${reqInfoWithHeaders(req)} - PUT action can not be triggered.(You MUST NOT see this message)`)
    res.send('private put')    
  })
  .options(function (req, res) {
    info(`${reqInfoWithHeaders(req)} - Someone attempt to options something(Because it is not a simple request). REJECT.`)
    res.sendStatus(403)        
  })
  .all(function (req, res) {
    info(`${reqInfoWithHeaders(req)} - Method Not Allowded`)
    res.sendStatus(405)    
  })

app.route('/public/resource')
  .all(cors(), function (req, res) {
    info(`${reqInfoWithHeaders(req)} - ${req.method} action is triggered`)
    res.send(`${req.method} response.`)   
  })

app.route('/public/credentials-resource')
  .all(cors(true), function (req, res) {
    info(`${reqInfoWithHeaders(req)} - ${req.method} action is triggered`)
    res.send(`${req.method} response.`)    
  })

app.get('/', function (req, res) {
  const sessionid = 'se5510nid'
  const csrftoken = 'c5rft0ken'
  res.cookie('sessionid', sessionid, { httpOnly: true })
  res.cookie('csrftoken', csrftoken)
  res.send(`<!doctype html>
<html>
  <head>
    <meta charset="utf-8">
    <title>CORS-CSRF-EXAMPLE</title>
    <script>
      window._Post = function(event) {
        var xhr = new XMLHttpRequest();
        xhr.open('POST', "/private/resource", true);
        xhr.setRequestHeader('X-CSRF-TOKEN', '${csrftoken}');
        xhr.send('bodydata');
        xhr.onreadystatechange = function() {
          if(xhr.readyState === XMLHttpRequest.DONE && xhr.status === 200) {
            alert('Got response: ' + xhr.responseText)
          }
        }
      }
    </script>
  </head>
  <body>
    <h1>you've logged in.</h1>
    <ul>
      <li>sessionid: ${sessionid}</li>
      <li>csrftoken: ${csrftoken}</li>
    </ul>
    <button onclick="window._Post()">POST with csrftoken</button>
  </body>
</html>
`)
})

app.get('*', function (req, res) {
  res.sendStatus(404)
})

console.log(`Listening on port ${port}...`)
server.listen(port, host, () => {
  console.log('server started')
})

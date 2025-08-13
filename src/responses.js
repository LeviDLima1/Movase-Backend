const answers = {
    success: (res, message, details) => {
      res.status(200).json({
        status: '200',
        message: message,
        details: details
      })
    },
    created: (res, message, details) => {
      res.status(201).json({
        status: '201',
        message: message,
        details: details
      })
    },
    badRequest: (res, message) => {
      res.status(400).json({
        status: '400',
        message: message
      })
    },
    unauthorized: (res, message) => {
      res.status(401).json({
        status: '401',
        message: message
      })
    },
    notFound: (res, message) => {
      res.status(404).json({
        status: '404',
        message: message
      })
    },
    semanticError: (res, message) => {
      res.status(422).json({
          status: '404',
          message: message
      })
    },
    internalServerError: (res, message, error) => {
      res.status(500).json({
        status: '500',
        message: message,
        error: error
      })
    }
  }
  
  export default answers
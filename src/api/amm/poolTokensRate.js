const { Joi } = require('dvf-utils')
const get = require('../../lib/dvf/get-generic')
const validateWithJoi = require('../../lib/validators/validateWithJoi')

const schema = Joi.object({
  poolName: Joi.string()
})

const validateInputs = validateWithJoi(schema)('INVALID_METHOD_ARGUMENT')({
  context: 'poolTokensRate'
})

module.exports = async (dvf, data) => {
  const { poolName } = validateInputs(data)
  const endpoint = `/v1/trading/amm/poolTokensRate/${poolName}`
  return get(dvf, endpoint)
}

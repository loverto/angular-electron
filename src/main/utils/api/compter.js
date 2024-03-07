/**
 * 计算机接口
 */

import request from '../request'

/**
 * 获取计算机列表
 */
export function getList(query) {
    return request({
        url: '/api/computers',
        method: 'get',
        params: query
    })
}

/**
 * 新增或更新计算机
 */

export function saveOrUpdate(data, method = 'post') {
    // 如果method为空，则默认为post,如果为put 则为更新,需要把路径加上id,把下面代码优化一下
    const rurl = method === 'put' ? '/api/computers/' + data.id : '/api/computers'
    return request({
        url: rurl,
        method,
        data
    })
}

/**
 * 获取审核列表
 */
export function getSearchList(query) {
    return request({
        url: '/api/_search/computers',
        method: 'get',
        params: query
    })
}

/**
 * 通过过滤器的方式获取数据
 */
export function getCompterListByFilter(query){
    return request({
        url: '/api/computers',
        method: 'get',
        params: query
    })
}

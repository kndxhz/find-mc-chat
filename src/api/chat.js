import request from '@/utils/request'

export function get_id() {
    return request({
        url: '/getid',
        method: 'get'
    })
}

export function get_data(data) {
    return request({
        url: '/getdata',
        method: 'get',
        params: data
    })
}
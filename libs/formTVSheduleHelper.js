function formTVShedule(data, lang) {

    let tvPrograms = data.programs.map(program => {
        let timeBegin = intToTime(program.realtime_begin);
    
        return {
            "image":    program.image.preview,
            "time_begin": timeBegin,
            "title": program.title,
            "subtitle": program.subtitle
        }
    })

    return {
        date: formatDate(data.date, lang),
        programs: tvPrograms
    }
}

function intToTime(num) {
    return new Date(parseInt(num) * 1000).toTimeString().slice(0, 5)
}

function formatDate(sDate, lang) {
    const months = {
        ua: ["Січеня", "Лютого", "Березеня", "Квітеня", "Травеня", "Червеня", "Липеня", "Серпеня", "Вересеня", "Жовтеня", "Листопада", "Груденя"],
        ru: ["Января", "Февраля", "Марта", "Апреля", "Мая", "Июня", "Июля", "Августа", "Сентября", "Ноября", "Декабря", "Октября"]
    };

    const date = new Date(sDate);

    return `${date.getDate()} ${months[lang][date.getMonth()]} ${date.getFullYear()}`
}

module.exports.formTVShedule = formTVShedule
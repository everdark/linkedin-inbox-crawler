#!/usr/bin/env Rscript

library(magrittr)
library(RSQLite)
library(data.table)
library(ggplot2)
library(ggTimeSeries)

DB_NAME <- "data.sqlite"
TBL_NAME <- "inbox_data"

conn <- dbConnect(SQLite(), DB_NAME)
inbox_data <- setDT(dbReadTable(conn, TBL_NAME))
inbox_data[last_mesg != "", .(time)]

message("Total number of messages: ", nrow(inbox_data))
message("Total number of distinct headhunts: ", uniqueN(inbox_data$sender))

parse_time <- function(inbox_data) {
    this_year <- year(Sys.time())
    last_year <- this_year - 1
    this_month <- month(Sys.time())
    this_month_abb <- month.abb[this_month]
    month_not_in_this_year <- month.abb[(this_month+1):12]
    not_this_year <- grepl("[0-9]{1,2}/[0-9]{1,2}/[0-9]{4}$", inbox_data$time)
    inbox_data[not_this_year, 
               parsed_time:=
        inbox_data$time[not_this_year] %>%
            gsub("^.*\\|", "", .) %>%
            as.POSIXct(format="%m/%d/%Y")]
    inbox_data[(!not_this_year) & grepl(paste(month_not_in_this_year, collapse='|'), time), 
               parsed_time:=
                    gsub("^.*\\|", "", time) %>%
                    paste(last_year) %>% 
                    as.POSIXct(format="%b %d %Y")]
    inbox_data[is.na(parsed_time),
               parsed_time:=
                   paste(this_year, time) %>%
                   as.POSIXct(format="%Y %b %d")]
    inbox_data[grepl("\\|Today", time), 
               parsed_time:=Sys.time()]
    inbox_data[, `:=`(d=as.Date(parsed_time),
                      m=factor(month(parsed_time), levels=1:12, labels=month.abb),
                      y=year(parsed_time),
                      wd=weekdays(parsed_time, abbreviate=TRUE) %>% 
                        factor(labels=rev(c("Mon","Tue","Wed","Thu","Fri","Sat","Sun"))))]
}

parse_time(inbox_data)

# plot calendar heatmap
dc <- inbox_data[last_mesg != "", .(.N), by="d"]
ch_plot <- ggplot_calendar_heatmap(dc, "d", "N") +
   xlab(NULL) + 
   ylab(NULL) + 
   scale_fill_continuous(low="lightblue", high="red") + 
   facet_wrap(~Year, ncol=1)
ggsave("calendar_heatmap.png", ch_plot)

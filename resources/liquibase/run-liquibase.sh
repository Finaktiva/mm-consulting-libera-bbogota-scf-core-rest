# $ sh run-liquibase-script.sh
liquibase --driver=com.mysql.cj.jdbc.Driver \
			--classpath="/opt/liquibase/connectors/mysql-connector-java-8.0.15.jar" \
			--changeLogFile=$1 \
			--url="jdbc:mysql://52.203.16.11:3306/liberadbstage" \
			--username="root" --password="M3nd4ld3" \
			update
import logging
import time

from django.core.management.base import BaseCommand, CommandError
from django.db import DatabaseError, close_old_connections, connection
from django.db.migrations.executor import MigrationExecutor

from apps.appointments.reminders.delivery import dispatch_reminders

logger = logging.getLogger(__name__)


class Command(BaseCommand):
    help = "Run the daily 10:00 Asia/Tehran appointment reminder worker."

    def add_arguments(self, parser):
        parser.add_argument("--once", action="store_true", help="Check the schedule once, then exit.")

    def handle(self, *args, **options):
        executor = MigrationExecutor(connection)
        if executor.migration_plan(executor.loader.graph.leaf_nodes()):
            raise CommandError("Apply database migrations before starting the reminder worker.")
        self.stdout.write("Appointment reminder worker: 10:00 Asia/Tehran; failed sends are not retried.")
        while True:
            close_old_connections()
            try:
                dispatch_reminders()
            except DatabaseError:
                if options["once"]:
                    raise
                logger.exception("Reminder worker database error")
            if options["once"]:
                return
            time.sleep(15)

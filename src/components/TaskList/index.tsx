import { ComponentProps } from 'react';
import Card from '@mui/material/Card';
import IconButton from '@mui/material/IconButton';
import CardContent from '@mui/material/CardContent';
import CardHeader from '@mui/material/CardHeader';
import Box from '@mui/material/Box';
import Chip from '@mui/material/Chip';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import DownloadIcon from '@mui/icons-material/Download';
import StartIcon from '@mui/icons-material/PlayCircle';
import StopIcon from '@mui/icons-material/Stop';
import LogIcon from '@mui/icons-material/Dvr';
import DuplicateIcon from '@mui/icons-material/ContentCopy';
import { JobTask, JobTaskStatus } from '@/types/job';
import Button from '@mui/material/Button';

interface TaskProps {
  taskName: string;
  status: JobTaskStatus;
  createdAt: string;
  disabled?: boolean;
  active?: boolean;
  onEdit?: VoidFunction;
  onLog?: VoidFunction;
  onTask?: VoidFunction;
  onDelete?: VoidFunction;
  onDuplicate?: VoidFunction;
  onDownload?: VoidFunction;
}

export interface TaskListProps {
  tasks: JobTask[];
  activeTaskId?: string;
  onEdit?: (id: string) => void;
  onLog?: (id: string) => void;
  onTask?: (id: string) => void;
  onDelete?: (id: string) => void;
  onDuplicate?: (id: string) => void;
  onDownload?: (id: string) => void;
  onAdd?: VoidFunction;
}

export const Task = ({
  status,
  taskName,
  createdAt,
  disabled,
  active,
  onDelete,
  onDownload,
  onDuplicate,
  onEdit,
  onLog,
  onTask,
}: TaskProps) => {
  const isReady = status === 'ready';
  const hasDone = status === 'done' || status === 'stopped';
  const chipColor: ComponentProps<typeof Chip>['color'] = (() => {
    switch (status) {
      case 'done':
        return 'success';
      case 'stopped':
        return 'error';
      case 'processing':
        return 'primary';
      case 'ready':
        return 'default';
    }
  })();

  return (
    <Card
      data-testid="taskListItem"
      sx={{
        border: '1px solid #ccc',
        position: 'relative',
        marginBottom: 1,
        ...(active ? { borderColor: 'primary.main' } : {}),
      }}
    >
      {disabled && (
        <Box
          sx={{
            position: 'absolute',
            left: 0,
            right: 0,
            top: 0,
            bottom: 0,
            backgroundColor: '#00000040',
            zIndex: 1,
          }}
        />
      )}
      <CardHeader
        title={taskName}
        titleTypographyProps={{
          overflow: 'hidden',
          textOverflow: 'ellipsis',
          width: 224,
        }}
        subheader={createdAt}
        action={
          <Box>
            {active ? (
              !hasDone && (
                <IconButton onClick={onTask} data-testid="taskBtn">
                  <StopIcon data-testid="stopBtn" />
                </IconButton>
              )
            ) : (
              <>
                {!hasDone && (
                  <IconButton
                    onClick={onTask}
                    data-testid="taskBtn"
                    disabled={disabled}
                  >
                    {isReady ? <StartIcon /> : <StopIcon />}
                  </IconButton>
                )}
                {hasDone && (
                  <>
                    <IconButton
                      onClick={onDownload}
                      disabled={disabled}
                      data-testid="downloadBtn"
                    >
                      <DownloadIcon />
                    </IconButton>
                    <IconButton
                      onClick={onLog}
                      disabled={disabled}
                      data-testid="logBtn"
                    >
                      <LogIcon />
                    </IconButton>
                  </>
                )}
                <IconButton
                  onClick={onDuplicate}
                  disabled={disabled}
                  data-testid="duplicateBtn"
                >
                  <DuplicateIcon />
                </IconButton>
                {!hasDone && (
                  <IconButton
                    onClick={onEdit}
                    disabled={disabled}
                    data-testid="editBtn"
                  >
                    <EditIcon />
                  </IconButton>
                )}
                <IconButton
                  onClick={onDelete}
                  disabled={disabled}
                  data-testid="deleteBtn"
                >
                  <DeleteIcon />
                </IconButton>
              </>
            )}
          </Box>
        }
      />
      <CardContent>
        <Chip
          data-testid="status"
          sx={{ textTransform: 'uppercase' }}
          label={status}
          color={chipColor}
        />
      </CardContent>
    </Card>
  );
};

const TaskList = ({
  tasks,
  activeTaskId,
  onDelete,
  onDownload,
  onDuplicate,
  onEdit,
  onLog,
  onTask,
  onAdd,
}: TaskListProps) => {
  // const handleTask = (taskId: string) => () => {
  //   const message =
  //     taskId === activeTaskId
  //       ? "Do you really want to stop the task?\nOnce you stop the task, you can't restart the task."
  //       : 'Do you want to start the task?';
  //   if (window.confirm(message)) {
  //     onTask?.(taskId);
  //   }
  // };
  const handleTask = (taskId: string) => () => {
    onTask?.(taskId);
  };

  const handleDownload = (taskId: string) => () => {
    onDownload?.(taskId);
  };

  const handleDelete = (taskId: string) => () => {
    onDelete?.(taskId);
  };
  // const handleDelete = (taskId: string) => () => {
  //   if (
  //     window.confirm(
  //       "Do you really want to delete the task?\nOnce you delete the task, you can't restore it."
  //     )
  //   ) {
  //     onDelete?.(taskId);
  //   }
  // };
  const handleDuplicate = (taskId: string) => () => {
    onDuplicate?.(taskId);
  };
  const handleEdit = (taskId: string) => () => {
    onEdit?.(taskId);
  };
  const handleLog = (taskId: string) => () => {
    onLog?.(taskId);
  };

  return (
    <Box
      p={1}
      flex={1}
      rowGap={1}
      sx={{
        overflowY: 'auto',
      }}
      data-testid="taskList"
    >
      <Box textAlign="right" mb={1}>
        <Button
          data-testid="addBtn"
          color="primary"
          variant="contained"
          onClick={onAdd}
        >
          Add Task
        </Button>
      </Box>
      {tasks.map((task) => (
        <Task
          key={task.id}
          active={activeTaskId === task.id}
          disabled={activeTaskId !== task.id && activeTaskId !== undefined}
          taskName={task.taskName}
          status={task.status}
          createdAt={task.createdAt}
          onTask={handleTask(task.id)}
          onDelete={handleDelete(task.id)}
          onDownload={handleDownload(task.id)}
          onDuplicate={handleDuplicate(task.id)}
          onEdit={handleEdit(task.id)}
          onLog={handleLog(task.id)}
        />
      ))}
    </Box>
  );
};

export default TaskList;

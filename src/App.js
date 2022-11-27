import {
  Alert,
  Button,
  Card,
  CardContent,
  Checkbox,
  Container,
  FormControlLabel,
  Grid,
  TextField,
  Typography,
} from '@mui/material';
import { useCallback, useRef, useState } from 'react';

function has3OverSameUnit(groupA, groupB) {
  let count = 0;
  groupA.forEach((unitA) => {
    if (groupB.some((unitB) => unitB.unit_id === unitA.unit_id)) count += 1;
  });

  return count > 2;
}

function App() {
  const [jsonError, setJsonError] = useState(false);
  const [open, setOpen] = useState(false);
  const [recordTime, setRecordTime] = useState({ to: 0, from: 0 });
  const [dataList, setDataList] = useState([]);

  const textElement = useRef();
  const isReverseInputElement = useRef();
  const alertTimer = useRef();

  const handleFocusCapture = useCallback(() => {
    setJsonError(false);
  }, []);

  const handleStack = useCallback(() => {
    const stringJSON = textElement.current.value;
    const reversed = isReverseInputElement.current.checked;

    let {
      data: { battle_list: data },
    } = JSON.parse(stringJSON);

    if (reversed) {
      data.reverse();
      setDataList((prev) => [...data, ...prev]);
    } else {
      data = reversed ? data.reverse() : data;
      setDataList((prev) => [...prev, ...data]);
    }
    textElement.current.value = '';
  }, []);

  const handleConvert = useCallback(async () => {
    try {
      const time = {};
      let lastDate = Math.floor((dataList[0].battle_end_time + 14400) / 86400);
      const text = dataList
        .map((d, i) => {
          if (i === 0) time.from = Number(d.battle_end_time) * 1000;
          if (i === dataList.length - 1)
            time.to = Number(d.battle_end_time) * 1000;

          const isCarried = dataList
            .filter((e, j) => j < i)
            .filter((e, j) => e.target_viewer_id === d.target_viewer_id)
            .filter(
              (e, j) =>
                Math.floor((e.battle_end_time + 14400) / 86400) ===
                Math.floor((d.battle_end_time + 14400) / 86400)
            )
            .some((e) => has3OverSameUnit(d.units, e.units));

          const date = Math.floor((d.battle_end_time + 14400) / 86400);
          const isDateOver = date > lastDate;
          lastDate = date;
          const dateDivider = '\t-\t\tfalse\n';
          return `${isDateOver ? dateDivider : ''}${d.order_num}\t${
            d.user_name
          }\t${d.total_damage}\t${isCarried}`;
        })
        .join('\n');

      setRecordTime(time);
      await navigator.clipboard.writeText(text);
      textElement.current.value = '';

      if (alertTimer.current) clearTimeout(alertTimer.current);
      setOpen(true);
      alertTimer.current = setTimeout(() => {
        setOpen(false);
        alertTimer.current = undefined;
      }, 10000);
    } catch (error) {
      if (error instanceof SyntaxError) {
        setJsonError(true);
        return;
      }

      console.error(error);
    }
  }, [dataList]);

  const handleClose = useCallback(() => {
    setOpen(false);
  }, []);

  return (
    <Container>
      <Card sx={{ mx: 'auto', my: 2, maxWidth: 'md' }}>
        <CardContent>
          <TextField
            inputRef={textElement}
            label="JSON"
            fullWidth
            multiline
            minRows={10}
            maxRows={10}
            autoFocus
            error={jsonError}
            helperText={jsonError && 'JSON 파싱 오류'}
            onFocusCapture={handleFocusCapture}
          />
          <Grid container sx={{ mt: 1 }}>
            <Grid item xs={4}>
              <Typography>{`저장된 데이터 수: ${dataList.length}`}</Typography>
            </Grid>
            <Grid item xs={2} sx={{ textAlign: 'center' }}>
              <Button
                variant="contained"
                sx={{ mx: 'auto' }}
                onClick={handleStack}
              >
                스택
              </Button>
            </Grid>
            <Grid item xs={2} sx={{ textAlign: 'center' }}>
              <Button
                variant="contained"
                sx={{ mx: 'auto' }}
                disabled={dataList.length === 0}
                onClick={handleConvert}
              >
                변환
              </Button>
            </Grid>
            <Grid item xs={4} sx={{ pr: 1, textAlign: 'right' }}>
              <FormControlLabel
                inputRef={isReverseInputElement}
                disabled={dataList.length > 0}
                control={<Checkbox defaultChecked />}
                label="순서 뒤집기"
                labelPlacement="start"
              />
            </Grid>
          </Grid>
          {open && (
            <Alert
              onClose={handleClose}
              severity="success"
              sx={{ mt: 1, maxWidth: 'md' }}
            >
              <Typography>복사되었습니다.</Typography>
              <Typography>
                {new Date(recordTime.from).toLocaleString()} ~{' '}
                {new Date(recordTime.to).toLocaleString()}
              </Typography>
            </Alert>
          )}
        </CardContent>
      </Card>
    </Container>
  );
}

export default App;

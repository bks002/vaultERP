"use client";
import React, { useEffect, useState } from "react";
import {
  Container,
  Typography,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  IconButton,
  Tooltip,
  Box,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Stack,
  TextField,
  MenuItem,
  FormControlLabel,
  Switch,
  InputAdornment,
} from "@mui/material";
import DeleteIcon from "@mui/icons-material/Delete";
import EditIcon from "@mui/icons-material/Edit";
import VisibilityIcon from "@mui/icons-material/Visibility";
import SearchIcon from "@mui/icons-material/Search";

import { useSelector } from "react-redux";
import { getAllShift } from "../../Services/ShiftService";
import { getInternalWorkOrdersByOffice } from "../../Services/InternalWorkOrderService";
import {
  getGradeCodesByWO,
  getOperationsAndCompoundsByGradeCode,
  getCompoundByOperationWO,
} from "../../Services/ConstructionDesignSheet";
import { getAllItems } from "../../Services/InventoryService";
import { getAllOperation } from "../../Services/OperationService";
import { getAllEmployees } from "../../Services/EmployeeService";
import { getEmployeesByOperation } from "../../Services/OperationService";
import { getAssetsByOperation } from "../../Services/AssetOperation";
import { getAllAssets } from "../../Services/AssetService";

import {
  getJobCards,
  deleteJobCard,
  createJobCard,
  updateJobCard,
} from "../../Services/JobCard";

const todayDate = () => new Date().toISOString().split("T")[0];

const AddEditJobCardDialog = ({
  open,
  onClose,
  onSave,
  initialData,
  shifts,
  internalWos,
  officeId,
  items,
  operations,
}) => {
  const [date, setDate] = useState(initialData?.date || todayDate());
  const [internalWO, setInternalWO] = useState(initialData?.internalWO || "");
  // replaced selectBy radio with toggle switch (true = grade, false = no-grade)
  const [selectByGrade, setSelectByGrade] = useState(
    initialData?.selectBy === "no-grade" ? false : true
  );
  const [gradeCodes, setGradeCodes] = useState([]);
  const [selectedGradeCode, setSelectedGradeCode] = useState(
    initialData?.gradeCode || ""
  );
  const [compoundDetails, setCompoundDetails] = useState([]);
  const [compoundName, setCompoundName] = useState("");
  const [operationName, setOperationName] = useState("");
  const [compoundChoices, setCompoundChoices] = useState([]);
  const [selectedCompoundId, setSelectedCompoundId] = useState("");
  const [compound, setCompound] = useState(initialData?.compound || "");
  const [operation, setOperation] = useState(initialData?.operation || "");
  const [operatorId, setOperatorId] = useState("");
  const [machineId, setMachineId] = useState("");
  const [shift, setShift] = useState(initialData?.shift || "");
  const [compacted, setCompacted] = useState(initialData?.compacted || "");
  const [dia, setDia] = useState(initialData?.dia || "");
  const [payOff, setPayOff] = useState(initialData?.payOff || "");
  const [takeUp, setTakeUp] = useState(initialData?.takeUp || "");
  const [embossing, setEmbossing] = useState(initialData?.embossing || "");
  const [remark, setRemark] = useState(initialData?.remark || "");
  const [hiddenGradeCode, setHiddenGradeCode] = useState("");
  const [employeesForOperation, setEmployeesForOperation] = useState([]);
  const [assetsForOperation, setAssetsForOperation] = useState([]);

  useEffect(() => {
    setDate(initialData?.date || todayDate());
    setInternalWO(initialData?.internalWO || "");
    setSelectByGrade(initialData?.selectBy === "no-grade" ? false : true);
    setGradeCodes([]);
    setSelectedGradeCode("");
    setCompoundDetails([]);
    setCompoundName("");
    setCompoundChoices([]);
    setSelectedCompoundId("");
    setOperationName("");
    setCompound(initialData?.compound || "");
    setOperation(initialData?.operation || "");
    setShift(initialData?.shift || "");
    setCompacted(initialData?.compacted || "");
    setDia(initialData?.dia || "");
    setPayOff(initialData?.payOff || "");
    setTakeUp(initialData?.takeUp || "");
    setEmbossing(initialData?.embossing || "");
    setRemark(initialData?.remark || "");
    setHiddenGradeCode("");
    setEmployeesForOperation([]);
    setAssetsForOperation([]);
    setOperatorId("");
    setMachineId("");
  }, [initialData, open]);

  useEffect(() => {
    if (internalWO && selectByGrade) {
      getGradeCodesByWO(internalWO)
        .then((codes) => {
          setGradeCodes(codes);
          if (initialData?.gradeCode && codes.includes(initialData.gradeCode)) {
            setSelectedGradeCode(initialData.gradeCode);
          } else {
            setSelectedGradeCode("");
          }
        })
        .catch(() => {
          setGradeCodes([]);
          setSelectedGradeCode("");
        });
    } else {
      setGradeCodes([]);
      setSelectedGradeCode("");
    }
  }, [internalWO, selectByGrade, initialData]);

  const fetchCompoundForNoGrade = async () => {
    if (!operation || !officeId || !internalWO || isNaN(Number(internalWO))) {
      setCompoundChoices([]);
      setSelectedCompoundId("");
      setCompoundName("");
      setHiddenGradeCode("");
      setCompoundDetails([]);
      return;
    }
    const foundOp = operations.find((op) => op.operationName === operation);
    if (!foundOp) {
      setCompoundChoices([]);
      setSelectedCompoundId("");
      setCompoundName("");
      setHiddenGradeCode("");
      setCompoundDetails([]);
      return;
    }
    try {
      const compounds = await getCompoundByOperationWO(
        foundOp.operationId,
        officeId,
        Number(internalWO)
      );
      setCompoundChoices(compounds || []);
      if (compounds && compounds.length > 0) {
        const initCompoundId =
          compounds.find((c) => c.itemId === selectedCompoundId)?.itemId ||
          compounds[0].itemId;
        setSelectedCompoundId(initCompoundId);
        const foundItem = items.find((i) => i.id === initCompoundId);
        setCompoundName(foundItem ? foundItem.name : "");
        setHiddenGradeCode(
          compounds.find((c) => c.itemId === initCompoundId).gradeCode || ""
        );
        const compoundSpecs =
          compounds.find((c) => c.itemId === initCompoundId)?.specifications ||
          [];
        setCompoundDetails(
          compoundSpecs.map((spec) => ({
            id: spec.id,
            specification: spec.specification,
            value: spec.value,
          }))
        );
      } else {
        setSelectedCompoundId("");
        setCompoundName("");
        setHiddenGradeCode("");
        setCompoundDetails([]);
      }
    } catch (err) {
      console.error("Error fetching compounds in no-grade", err);
      setCompoundChoices([]);
      setSelectedCompoundId("");
      setCompoundName("");
      setHiddenGradeCode("");
      setCompoundDetails([]);
    }
  };

  useEffect(() => {
    if (selectByGrade && selectedGradeCode && officeId) {
      getOperationsAndCompoundsByGradeCode(selectedGradeCode, officeId)
        .then((details) => {
          if (!details || details.length === 0) {
            setCompoundDetails([]);
            setCompoundChoices([]);
            setCompoundName("");
            setOperationName("");
            setOperation("");
            setHiddenGradeCode("");
            setSelectedCompoundId("");
            return;
          }

          const compoundOptions = details.reduce((acc, curr) => {
            if (!acc.find((item) => item.itemId === curr.itemId)) {
              acc.push(curr);
            }
            return acc;
          }, []);

          setCompoundChoices(compoundOptions);

          const chosenCompoundId =
            compoundOptions.find((c) => c.itemId === selectedCompoundId)
              ?.itemId || compoundOptions[0].itemId;

          const specsForCompound = details.filter(
            (spec) => spec.itemId === chosenCompoundId
          );

          setCompoundDetails(specsForCompound);

          const foundItem = items.find((i) => i.id === chosenCompoundId);
          setCompoundName(foundItem ? foundItem.name : "");

          if (specsForCompound.length > 0) {
            setHiddenGradeCode(specsForCompound[0].gradecode || "");
          } else {
            setHiddenGradeCode("");
          }

          const firstOpId = specsForCompound[0]?.operationId;
          const foundOp = operations.find((o) => o.operationId === firstOpId);
          setOperationName(foundOp ? foundOp.operationName : "");
          setOperation(foundOp ? foundOp.operationName : "");
          setSelectedCompoundId(chosenCompoundId);
        })
        .catch(() => {
          setCompoundDetails([]);
          setCompoundName("");
          setOperationName("");
          setOperation("");
          setHiddenGradeCode("");
          setCompoundChoices([]);
          setSelectedCompoundId("");
        });
    } else if (!selectByGrade) {
      fetchCompoundForNoGrade();
    } else {
      setCompoundDetails([]);
      setCompoundName("");
      setOperationName("");
      setOperation("");
      setHiddenGradeCode("");
      setCompoundChoices([]);
      setSelectedCompoundId("");
    }
  }, [
    selectByGrade,
    selectedGradeCode,
    officeId,
    items,
    operations,
    operation,
    internalWO,
    selectedCompoundId,
  ]);

  useEffect(() => {
    const fetchEmployeesForOperation = async () => {
      if (!operation) {
        setEmployeesForOperation([]);
        setOperatorId("");
        return;
      }
      const foundOp = operations.find((op) => op.operationName === operation);
      if (!foundOp) {
        setEmployeesForOperation([]);
        setOperatorId("");
        return;
      }
      try {
        const emps = await getEmployeesByOperation(foundOp.operationId);
        setEmployeesForOperation(emps || []);
        if (initialData && initialData.operatorName) {
          const matchedEmp = emps.find(
            (e) => e.employeeName === initialData.operatorName
          );
          setOperatorId(matchedEmp ? matchedEmp.employeeId : "");
        } else {
          setOperatorId("");
        }
      } catch (err) {
        console.error("Error fetching employees for operation", err);
        setEmployeesForOperation([]);
        setOperatorId("");
      }
    };
    fetchEmployeesForOperation();
  }, [operation, operations, initialData]);

  useEffect(() => {
    const fetchAssetsForOperation = async () => {
      if (!operation) {
        setAssetsForOperation([]);
        setMachineId("");
        return;
      }
      const foundOp = operations.find((op) => op.operationName === operation);
      if (!foundOp) {
        setAssetsForOperation([]);
        setMachineId("");
        return;
      }
      try {
        const assets = await getAssetsByOperation(foundOp.operationId);
        setAssetsForOperation(assets || []);
        if (initialData && initialData.machine) {
          const matchedAsset = assets.find(
            (a) => a.assetName === initialData.machine
          );
          setMachineId(matchedAsset ? matchedAsset.assetId : "");
        } else {
          setMachineId("");
        }
      } catch (err) {
        console.error("Error fetching assets for operation", err);
        setAssetsForOperation([]);
        setMachineId("");
      }
    };
    fetchAssetsForOperation();
  }, [operation, operations, initialData]);

  const disabledSave =
    !date ||
    !internalWO ||
    (selectByGrade && !selectedGradeCode) ||
    !compoundName ||
    !operation ||
    !operatorId ||
    !machineId ||
    !shift;

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
      <DialogTitle>
        {initialData ? "Edit Job Card" : "Add Job Card"}
      </DialogTitle>
      <DialogContent>
        <form autoComplete="off">
          <Stack spacing={2} sx={{ mt: 1 }}>
            <TextField
              label="Date"
              type="date"
              fullWidth
              value={date}
              onChange={(e) => setDate(e.target.value)}
              InputLabelProps={{ shrink: true }}
            />
            <TextField
              select
              label="Internal Work Order"
              fullWidth
              value={internalWO}
              onChange={(e) => setInternalWO(e.target.value)}
            >
              {internalWos.map((wo) => (
                <MenuItem key={wo.id} value={wo.id}>
                  {wo.id}
                </MenuItem>
              ))}
            </TextField>

            {/* Toggle switch replacing radio buttons */}
            <FormControlLabel
              control={
                <Switch
                  checked={selectByGrade}
                  onChange={() => {
                    const newSelectByGrade = !selectByGrade;
                    setSelectByGrade(newSelectByGrade);

                    // Reset operation when switching to No Grade flow
                    if (!newSelectByGrade) {
                      setOperation("");
                    }
                  }}
                  color="primary"
                />
              }
              label="Grade Code"
            />

            {selectByGrade && (
              <>
                <TextField
                  select
                  label="Grade Code"
                  fullWidth
                  value={selectedGradeCode}
                  onChange={(e) => setSelectedGradeCode(e.target.value)}
                >
                  {gradeCodes.map((code) => (
                    <MenuItem key={code} value={code}>
                      {code}
                    </MenuItem>
                  ))}
                </TextField>
                <TextField
                  select
                  label="Operation"
                  fullWidth
                  value={operationName || operation}
                  onChange={(e) => setOperation(e.target.value)}
                >
                  {compoundDetails.length > 0
                    ? Array.from(
                        new Set(
                          compoundDetails.map(
                            (detail) =>
                              detail.operationName || operationName || operation
                          )
                        )
                      ).map((opName) => (
                        <MenuItem key={opName} value={opName}>
                          {opName}
                        </MenuItem>
                      ))
                    : operations.map((op) => (
                        <MenuItem key={op.operationId} value={op.operationName}>
                          {op.operationName}
                        </MenuItem>
                      ))}
                </TextField>
                <TextField
                  select
                  label="Compound"
                  fullWidth
                  value={selectedCompoundId}
                  onChange={(e) => {
                    const chosenId = e.target.value;
                    setSelectedCompoundId(chosenId);
                    const foundItem = items.find((i) => i.id === chosenId);
                    setCompoundName(foundItem ? foundItem.name : "");
                    const specsForCompound = compoundChoices.filter(
                      (spec) => spec.itemId === chosenId
                    );
                    setCompoundDetails(specsForCompound);
                    setHiddenGradeCode(specsForCompound[0]?.gradecode || "");
                  }}
                >
                  {compoundChoices.length === 0 ? (
                    <MenuItem value="">No compounds available</MenuItem>
                  ) : (
                    compoundChoices.map((choice) => {
                      const itemName =
                        items.find((i) => i.id === choice.itemId)?.name ||
                        `Item #${choice.itemId}`;
                      return (
                        <MenuItem key={choice.itemId} value={choice.itemId}>
                          {itemName}
                        </MenuItem>
                      );
                    })
                  )}
                </TextField>
              </>
            )}

            {!selectByGrade && (
              <>
                <TextField
                  select
                  label="Operation"
                  fullWidth
                  value={operation}
                  onChange={(e) => setOperation(e.target.value)}
                >
                  {operations.map((op) => (
                    <MenuItem key={op.operationId} value={op.operationName}>
                      {op.operationName}
                    </MenuItem>
                  ))}
                </TextField>
                <TextField
                  select
                  label="Compound"
                  fullWidth
                  value={selectedCompoundId}
                  onChange={(e) => {
                    const chosenId = e.target.value;
                    const chosenCompound = compoundChoices.find(
                      (c) => c.itemId === chosenId
                    );
                    const foundItem = items.find((i) => i.id === chosenId);
                    setSelectedCompoundId(chosenId);
                    setCompoundName(foundItem ? foundItem.name : "");
                    setHiddenGradeCode(chosenCompound?.gradeCode || "");
                    if (chosenCompound?.specifications?.length > 0) {
                      setCompoundDetails(
                        chosenCompound.specifications.map((spec) => ({
                          id: spec.id,
                          specification: spec.specification,
                          value: spec.value,
                        }))
                      );
                    } else {
                      setCompoundDetails([]);
                    }
                  }}
                  disabled={compoundChoices.length === 0}
                >
                  {compoundChoices.length === 0 ? (
                    <MenuItem value="">No compounds available</MenuItem>
                  ) : (
                    compoundChoices.map((choice) => {
                      const itemName =
                        items.find((i) => i.id === choice.itemId)?.name ||
                        `Item #${choice.itemId}`;
                      return (
                        <MenuItem key={choice.itemId} value={choice.itemId}>
                          {itemName}
                        </MenuItem>
                      );
                    })
                  )}
                </TextField>
              </>
            )}

            {compoundDetails.length > 0 && (
              <Paper elevation={1} sx={{ mt: 2, p: 1 }}>
                <div style={{ fontWeight: 600, marginBottom: 4 }}>
                  Compound :-{" "}
                  <span style={{ fontWeight: "normal" }}>{compoundName}</span>
                </div>
                <Table size="small">
                  <TableHead>
                    <TableRow>
                      <TableCell>Specification</TableCell>
                      <TableCell>Value</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {compoundDetails.map((detail) => (
                      <TableRow key={detail.id}>
                        <TableCell>{detail.specification}</TableCell>
                        <TableCell>{detail.value}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </Paper>
            )}
            <TextField
              select
              label="Operator Name"
              fullWidth
              value={operatorId}
              onChange={(e) => setOperatorId(e.target.value)}
              disabled={employeesForOperation.length === 0}
            >
              <MenuItem value="" disabled>
                Choose...
              </MenuItem>
              {employeesForOperation.map((emp) => (
                <MenuItem key={emp.employeeId} value={emp.employeeId}>
                  {emp.employeeName}
                </MenuItem>
              ))}
            </TextField>
            <TextField
              select
              label="Machine"
              fullWidth
              value={machineId}
              onChange={(e) => setMachineId(e.target.value)}
              disabled={assetsForOperation.length === 0}
            >
              <MenuItem value="" disabled>
                Choose...
              </MenuItem>
              {assetsForOperation.map((asset) => (
                <MenuItem key={asset.assetId} value={asset.assetId}>
                  {asset.assetName}
                </MenuItem>
              ))}
            </TextField>
            <TextField
              select
              label="Shift"
              fullWidth
              value={shift}
              onChange={(e) => setShift(e.target.value)}
            >
              {shifts.map((s) => (
                <MenuItem key={s.shiftId} value={s.shiftId}>
                  {s.shiftName}
                </MenuItem>
              ))}
            </TextField>
            <TextField
              select
              label="Compacted"
              fullWidth
              value={compacted}
              onChange={(e) => setCompacted(e.target.value)}
            >
              <MenuItem value="Yes">Yes</MenuItem>
              <MenuItem value="No">No</MenuItem>
            </TextField>
            <TextField
              label="Dia of AM Wire/Strip"
              fullWidth
              value={dia}
              onChange={(e) => setDia(e.target.value)}
            />
            <TextField
              label="Pay Off D.No"
              fullWidth
              value={payOff}
              onChange={(e) => setPayOff(e.target.value)}
            />
            <TextField
              label="Take Up Drum Size"
              fullWidth
              value={takeUp}
              onChange={(e) => setTakeUp(e.target.value)}
            />
            <TextField
              label="Embossing"
              fullWidth
              value={embossing}
              onChange={(e) => setEmbossing(e.target.value)}
            />
            <TextField
              label="Remark"
              fullWidth
              value={remark}
              onChange={(e) => setRemark(e.target.value)}
            />
          </Stack>
        </form>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <Button
          disabled={disabledSave}
          variant="contained"
          onClick={() =>
            onSave({
              ...initialData,
              date,
              internalWO,
              selectBy: selectByGrade ? "grade" : "no-grade",
              gradeCode: selectByGrade ? selectedGradeCode : hiddenGradeCode,
              compound: selectByGrade
                ? compoundName || compound
                : items.find((i) => i.id === selectedCompoundId)?.name ||
                  compoundName,
              operation,
              operatorName:
                employeesForOperation.find((e) => e.employeeId === operatorId)
                  ?.employeeName || "",
              machine:
                assetsForOperation.find((a) => a.assetId === machineId)
                  ?.assetName || "",
              shift,
              compacted,
              dia,
              payOff,
              takeUp,
              embossing,
              remark,
            })
          }
        >
          {initialData ? "Update" : "Save"}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

const ViewJobCardDialog = ({ open, onClose, data, shifts }) => {
  if (!data) return null;

  const compoundName = data.compound || "N/A";
  const compoundDetails = data.specifications || data.compoundDetails || [];

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
      <DialogTitle>View Job Card</DialogTitle>
      <DialogContent>
        <Stack spacing={2} sx={{ mt: 1 }}>
          <TextField label="Date" fullWidth value={data.date || ""} disabled />
          <TextField
            label="Internal WO"
            fullWidth
            value={data.internalWO || ""}
            disabled
          />
          <TextField
            label="Grade Code"
            fullWidth
            value={data.gradeCode || ""}
            disabled
          />
          <TextField label="Compound" value={compoundName} fullWidth disabled />
          <Paper
            elevation={1}
            sx={{ p: 2, pointerEvents: "none", opacity: 0.6 }}
          >
            <div style={{ fontWeight: 600, marginBottom: 4 }}>
              Compound :-{" "}
              <span style={{ fontWeight: "normal" }}>{compoundName}</span>
            </div>
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell>Specification</TableCell>
                  <TableCell>Value</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {compoundDetails.length > 0 ? (
                  compoundDetails.map((spec, idx) => (
                    <TableRow key={idx}>
                      <TableCell>
                        {spec.specification || spec.name || "-"}
                      </TableCell>
                      <TableCell>{spec.value || "-"}</TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={2} align="center">
                      No specifications available
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </Paper>
          <TextField
            label="Operation"
            fullWidth
            value={data.operation || ""}
            disabled
          />
          <TextField
            label="Operator Name"
            fullWidth
            value={data.operatorName || ""}
            disabled
          />
          <TextField
            label="Machine"
            fullWidth
            value={data.machine || ""}
            disabled
          />
          <TextField
            label="Shift"
            fullWidth
            value={
              shifts.find((s) => String(s.shiftId) === String(data.shift))
                ?.shiftName || ""
            }
            disabled
          />
          <TextField
            label="Compacted"
            fullWidth
            value={data.compacted || ""}
            disabled
          />
          <TextField
            label="Dia of AM Wire/Strip"
            fullWidth
            value={data.dia || ""}
            disabled
          />
          <TextField
            label="Pay Off D.No"
            fullWidth
            value={data.payOff || ""}
            disabled
          />
          <TextField
            label="Take Up Drum Size"
            fullWidth
            value={data.takeUp || ""}
            disabled
          />
          <TextField
            label="Embossing"
            fullWidth
            value={data.embossing || ""}
            disabled
          />
          <TextField
            label="Remark"
            fullWidth
            value={data.remark || ""}
            disabled
          />
        </Stack>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Close</Button>
      </DialogActions>
    </Dialog>
  );
};

const JobCardMaster = () => {
  const officeId = useSelector((state) => state.user.officeId);
  const [shifts, setShifts] = useState([]);
  const [internalWos, setInternalWos] = useState([]);
  const [items, setItems] = useState([]);
  const [operations, setOperations] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [assets, setAssets] = useState([]);
  const [jobCards, setJobCards] = useState([]);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [viewDialogOpen, setViewDialogOpen] = useState(false);
  const [editData, setEditData] = useState(null);
  const [viewData, setViewData] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [employeesByOperation, setEmployeesByOperation] = useState({});

  // Load master/reference data first
  useEffect(() => {
    if (officeId) {
      getAllShift(officeId).then(setShifts).catch(console.error);
      getInternalWorkOrdersByOffice(officeId)
        .then(setInternalWos)
        .catch(console.error);
      getAllItems(officeId).then(setItems).catch(console.error);
      getAllOperation(officeId).then(setOperations).catch(console.error);
      getAllEmployees(officeId).then(setEmployees).catch(console.error);
      getAllAssets(officeId).then(setAssets).catch(console.error);
    }
  }, [officeId]);

  // Load job cards and map IDs to names using master data
  useEffect(() => {
    if (
      officeId &&
      items.length > 0 &&
      operations.length > 0 &&
      employees.length > 0 &&
      assets.length > 0 &&
      shifts.length > 0
    ) {
      getJobCards(officeId)
        .then((data) => {
          const formattedJobCards = data.map((jc) => ({
            id: jc.id,
            internalWO: jc.internalWo,
            isCode: jc.isCode,
            date: jc.date ? jc.date.split("T")[0] : "",
            shift: jc.shiftId,
            machine:
              assets.find((a) => a.assetId === jc.assetId)?.assetName || "",
            gradeCode: jc.gradeCode || "",
            compound: items.find((i) => i.id === jc.itemId)?.name || "",
            operation:
              operations.find((o) => o.operationId === jc.operationId)
                ?.operationName || "",
            operatorName:
              employees.find((e) => e.employeeId === jc.operatorId)
                ?.employeeName || "",
            compacted: jc.compected === 1 ? "Yes" : "No",
            dia: jc.noDiaOfAmWire,
            payOff: jc.payOffDNo,
            takeUp: jc.takeUpDrumSize,
            embossing: jc.embrossing,
            remark: jc.remark,
            isActive: jc.isActive,
            officeId: jc.officeId,
            createdBy: jc.createdBy,
            createdOn: jc.createdOn,
            updatedBy: jc.updatedBy,
            updatedOn: jc.updatedOn,
            operationId: jc.operationId,
            operatorId: jc.operatorId,
            assetId: jc.assetId,
            itemId: jc.itemId,
            shiftId: jc.shiftId,
          }));
          setJobCards(formattedJobCards);
        })
        .catch((err) => {
          console.error("Error fetching job cards:", err);
          setJobCards([]);
        });
    }
  }, [officeId, items, operations, employees, assets, shifts]);

  useEffect(() => {
    const uniqueOperationIds = new Set();
    jobCards.forEach((card) => {
      if (card.operationId) {
        uniqueOperationIds.add(card.operationId);
      }
    });

    uniqueOperationIds.forEach((operationId) => {
      if (!employeesByOperation[operationId]) {
        getEmployeesByOperation(operationId)
          .then((data) => {
            setEmployeesByOperation((prev) => ({
              ...prev,
              [operationId]: data,
            }));
          })
          .catch((err) => {
            console.error(
              `Failed to fetch employees for operationId ${operationId}:`,
              err
            );
          });
      }
    });
  }, [jobCards, employeesByOperation]);

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this Job Card?")) {
      try {
        await deleteJobCard(id);
        setJobCards((cards) => cards.filter((card) => card.id !== id));
      } catch (err) {
        console.error("Failed to delete job card", err);
      }
    }
  };

  const handleAddClick = () => {
    setEditData(null);
    setEditDialogOpen(true);
  };

  const handleEditClick = (card) => {
    setEditData(card);
    setEditDialogOpen(true);
  };

  const handleViewClick = async (card) => {
    let compoundDetails = [];
    let compoundName = card.compound || "";

    if (card.gradeCode && officeId) {
      try {
        const details = await getOperationsAndCompoundsByGradeCode(
          card.gradeCode,
          officeId
        );
        compoundDetails = details || [];
        if (details && details.length > 0) {
          const firstDetail = details[0];
          if (firstDetail.itemName) compoundName = firstDetail.itemName;
        }
      } catch (error) {
        console.error(
          "Failed to fetch compound details for view dialog:",
          error
        );
      }
    }

    setViewData({ ...card, compoundDetails, compoundName });
    setViewDialogOpen(true);
  };

  const handleSave = async (data) => {
    if (data.id) {
      try {
        const payload = {
          id: data.id,
          internalWo: Number(data.internalWO),
          isCode: data.isCode || "",
          date: new Date(data.date).toISOString(),
          shiftId: Number(data.shift),
          assetId: Number(
            assets.find((a) => a.assetName === data.machine)?.assetId || 0
          ),
          itemId: Number(items.find((i) => i.name === data.compound)?.id || 0),
          compected: data.compacted === "Yes" ? 1 : 0,
          noDiaOfAmWire: data.dia || "",
          payOffDNo: data.payOff || "",
          takeUpDrumSize: data.takeUp || "",
          embrossing: data.embrossing || "",
          remark: data.remark,
          isActive: true,
          officeId: officeId,
          gradeCode: data.gradeCode || "",
          createdBy: 0,
          createdOn: new Date().toISOString(),
          updatedBy: 0,
          updatedOn: new Date().toISOString(),
          operationId: Number(
            operations.find((o) => o.operationName === data.operation)
              ?.operationId || 0
          ),
          operatorId: Number(
            employees.find((e) => e.employeeName === data.operatorName)
              ?.employeeId || 0
          ),
        };

        await updateJobCard(data.id, payload);

        setJobCards((cards) =>
          cards.map((card) => (card.id === data.id ? data : card))
        );
        setEditDialogOpen(false);
      } catch (error) {
        console.error("Failed to update job card", error);
      }
    } else {
      try {
        const payload = {
          id: 0,
          internalWo: Number(data.internalWO),
          isCode: data.isCode || "",
          date: new Date(data.date).toISOString(),
          shiftId: Number(data.shift),
          assetId: Number(
            assets.find((a) => a.assetName === data.machine)?.assetId || 0
          ),
          itemId: Number(items.find((i) => i.name === data.compound)?.id || 0),
          compected: data.compacted === "Yes" ? 1 : 0,
          noDiaOfAmWire: data.dia || "",
          payOffDNo: data.payOff || "",
          takeUpDrumSize: data.takeUp || "",
          embrossing: data.embrossing || "",
          remark: data.remark,
          isActive: true,
          officeId: officeId,
          gradeCode: data.gradeCode || "",
          createdBy: 0,
          createdOn: new Date().toISOString(),
          updatedBy: 0,
          updatedOn: new Date().toISOString(),
          operationId: Number(
            operations.find((o) => o.operationName === data.operation)
              ?.operationId || 0
          ),
          operatorId: Number(
            employees.find((e) => e.employeeName === data.operatorName)
              ?.employeeId || 0
          ),
        };

        const createdJobCard = await createJobCard(payload);

        // REFRESH job cards from backend after creation (Option 1 fix)
        const freshJobCards = await getJobCards(officeId);
        const formattedJobCards = freshJobCards.map((jc) => ({
          id: jc.id,
          internalWO: jc.internalWo,
          isCode: jc.isCode,
          date: jc.date ? jc.date.split("T")[0] : "",
          shift: jc.shiftId,
          machine:
            assets.find((a) => a.assetId === jc.assetId)?.assetName || "",
          gradeCode: jc.gradeCode || "",
          compound: items.find((i) => i.id === jc.itemId)?.name || "",
          operation:
            operations.find((o) => o.operationId === jc.operationId)
              ?.operationName || "",
          operatorName:
            employees.find((e) => e.employeeId === jc.operatorId)
              ?.employeeName || "",
          compacted: jc.compected === 1 ? "Yes" : "No",
          dia: jc.noDiaOfAmWire,
          payOff: jc.payOffDNo,
          takeUp: jc.takeUpDrumSize,
          embossing: jc.embrossing,
          remark: jc.remark,
          isActive: jc.isActive,
          officeId: jc.officeId,
          createdBy: jc.createdBy,
          createdOn: jc.createdOn,
          updatedBy: jc.updatedBy,
          updatedOn: jc.updatedOn,
          operationId: jc.operationId,
          operatorId: jc.operatorId,
          assetId: jc.assetId,
          itemId: jc.itemId,
          shiftId: jc.shiftId,
        }));
        setJobCards(formattedJobCards);

        setEditDialogOpen(false);
      } catch (error) {
        console.error("Failed to create job card", error);
      }
    }
  };

  const handleCloseEdit = () => {
    setEditData(null);
    setEditDialogOpen(false);
  };

  const getOperatorDisplayName = (operatorName) => operatorName || "";

  const filteredJobCards = jobCards.filter((card) => {
    const term = searchTerm.toLowerCase();
    return (
      (card.internalWO || "").toString().toLowerCase().includes(term) ||
      (card.shift || "").toString().toLowerCase().includes(term) ||
      (card.machine || "").toString().toLowerCase().includes(term) ||
      (card.gradeCode || "").toLowerCase().includes(term) ||
      (card.operation || "").toLowerCase().includes(term) ||
      (card.operatorName || "").toLowerCase().includes(term) ||
      (card.date || "").toLowerCase().includes(term) ||
      (card.isCode || "").toLowerCase().includes(term)
    );
  });

  return (
    <Container>
      <Box
        display="flex"
        justifyContent="space-between"
        alignItems="center"
        sx={{ mb: 2 }}
      >
        <Typography variant="h4">Job Card Master</Typography>
        <Box display="flex" alignItems="center" gap={2}>
          <TextField
            size="small"
            placeholder="Search"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon />
                </InputAdornment>
              ),
            }}
            sx={{ minWidth: 220 }}
          />
          <Button variant="contained" color="primary" onClick={handleAddClick}>
            Add Job Card
          </Button>
        </Box>
      </Box>
      <TableContainer component={Paper} sx={{ mt: 2 }}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Internal WO</TableCell>
              <TableCell>Shift</TableCell>
              <TableCell>Compound</TableCell>
              <TableCell>Machine</TableCell>
              <TableCell>Grade Code</TableCell>
              <TableCell>Operation</TableCell>
              <TableCell>Operator Name</TableCell>
              <TableCell>Date</TableCell>
              <TableCell align="center">Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {filteredJobCards.length === 0 ? (
              <TableRow>
                <TableCell colSpan={9} align="center">
                  No records found
                </TableCell>
              </TableRow>
            ) : (
              filteredJobCards.map((card) => (
                <TableRow key={card.id}>
                  <TableCell>{card.internalWO || ""}</TableCell>
                  <TableCell>
                    {shifts.find(
                      (s) => String(s.shiftId) === String(card.shift)
                    )?.shiftName ||
                      card.shift ||
                      ""}
                  </TableCell>
                  <TableCell>{card.compound || ""}</TableCell>
                  <TableCell>{card.machine || ""}</TableCell>
                  <TableCell>{card.gradeCode || ""}</TableCell>
                  <TableCell>{card.operation || ""}</TableCell>
                  <TableCell>
                    {getOperatorDisplayName(card.operatorName)}
                  </TableCell>
                  <TableCell>{card.date || ""}</TableCell>
                  <TableCell align="center">
                    <Tooltip title="Edit">
                      <IconButton
                        color="primary"
                        onClick={() => handleEditClick(card)}
                      >
                        <EditIcon />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="View">
                      <IconButton
                        color="info"
                        onClick={() => handleViewClick(card)}
                      >
                        <VisibilityIcon />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="Delete">
                      <IconButton
                        color="error"
                        onClick={() => handleDelete(card.id)}
                      >
                        <DeleteIcon />
                      </IconButton>
                    </Tooltip>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </TableContainer>
      <AddEditJobCardDialog
        open={editDialogOpen}
        onClose={handleCloseEdit}
        onSave={handleSave}
        initialData={editData}
        shifts={shifts}
        internalWos={internalWos}
        items={items}
        operations={operations}
        officeId={officeId}
      />
      <ViewJobCardDialog
        open={viewDialogOpen}
        onClose={() => setViewDialogOpen(false)}
        data={viewData}
        shifts={shifts}
      />
    </Container>
  );
};

export default JobCardMaster;
